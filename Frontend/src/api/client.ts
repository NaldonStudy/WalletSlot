import { API_CONFIG } from '@/src/constants';
import { USE_MSW } from '@/src/constants/api';
import { authService } from '@/src/services/authService';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import type { ApiError, BaseResponse } from '@/src/types';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value: string) => void;
    reject: (error: any) => void;
  }[] = [];
  private generateRequestId(): string {
    try {
      const rnd = Math.random().toString(36).slice(2);
      return `req_${Date.now().toString(36)}_${rnd}`;
    } catch {
      return `req_${Date.now()}`;
    }
  }
  private sanitizePayload(obj: any) {
    try {
      if (!obj || typeof obj !== 'object') return obj;
      const clone: any = Array.isArray(obj) ? [...obj] : { ...obj };
      const mask = (v: any, showStart: number = 0) => {
        if (typeof v !== 'string') return '****';
        if (v.length <= showStart) return '****';
        return v.slice(0, showStart) + '****';
      };
      const keysToMask = [
        'pin',
        'newPin',
        'oldPin',
        'password',
        'pushToken',
        'refreshToken',
        'verificationCode',
        'smsCode',
      ];
      for (const k of Object.keys(clone)) {
        const v = (clone as any)[k];
        if (keysToMask.includes(k)) {
          (clone as any)[k] = mask(v, k === 'pushToken' ? 20 : 0);
        } else if (v && typeof v === 'object') {
          (clone as any)[k] = this.sanitizePayload(v);
        }
      }
      return clone;
    } catch {
      return obj;
    }
  }

  constructor() {
    const baseURL = USE_MSW ? '' : API_CONFIG.BASE_URL;

    this.client = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 요청 인터셉터 - X-Device-Id 및 토큰 자동 첨부
    this.client.interceptors.request.use(
      async (config) => {
        // headers 안전 대입
        const headers = { ...config.headers } as any;
        // Request ID 부여 (백엔드 트레이싱용)
        const requestId = this.generateRequestId();
        headers['X-Request-Id'] = requestId;
        
        // X-Device-Id 헤더 추가 (모든 요청에 필수)
        try {
          headers['X-Device-Id'] = await getOrCreateDeviceId();
        } catch (error) {
          console.error('[API] DeviceId 조회 실패:', error);
          // deviceId 조회 실패 시에도 요청은 계속 진행 (fallback 처리)
        }

        // Authorization 헤더 추가 (토큰이 있을 때만)
        const token = await this.getAccessToken();
        const skipAuth = (config as any).skipAuth === true;
        if (!skipAuth && token) {
          headers.Authorization = `Bearer ${token}`;
        }
  // 개발 바이패스 없음: 일반 인증 헤더 동작을 유지합니다. 푸시 엔드포인트는 기존 토큰을 사용합니다.

        // RefreshToken은 재발급 전용이며 일반 요청에 포함하지 않음 (보안/사양 일치)

  // headers 및 메타 할당
  (config as any).requestId = requestId;
  config.headers = headers;

        // 디버그 로그 (dev only, 민감정보 마스킹)
        if (__DEV__) {
          try {
            const method = (config.method || 'get').toUpperCase();
            const fullUrl = `${config.baseURL || ''}${config.url}`;
            const payload = this.sanitizePayload(config.params || config.data || {});
            const headerLog: any = { ...(headers || {}) };
            // if (headerLog.Authorization) headerLog.Authorization = 'Bearer ****';
            console.log(`[API] Request -> ${method} ${fullUrl}`, payload);
            console.log('[API] Headers:', headerLog);
          } catch (e) {}
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          try {
            console.log('[API] Response:', {
              url: `${response.config.baseURL || ''}${response.config.url}`,
              status: response.status,
            });
          } catch {}
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          // 특정 요청은 401이어도 리프레시를 시도하지 않음
          if (originalRequest?.noRefresh) {
            return Promise.reject(this.handleError(error));
          }
          // 로그인 전에는 refreshToken이 없으므로 401 재발급 비활성
          if (!(await this.canRefresh())) {
            return Promise.reject(this.handleError(error));
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await this.redirectToAuthScreen();
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        // 특정 요청은 재시도를 비활성화할 수 있음 (e.g., 회원가입 티켓 단발성)
        if (originalRequest?.disableRetry) {
          return Promise.reject(this.handleError(error));
        }

        // ===== Generic retry (network/5xx/429) with exponential backoff =====
        try {
          const status = error.response?.status;
          const isNetworkError = !error.response; // request made but no response (timeout, offline, etc.)
          const shouldRetry = isNetworkError || status === 429 || (typeof status === 'number' && status >= 500 && status < 600);

          // Avoid retrying uploads/multipart blindly (simple heuristic)
          const isMultipart = (originalRequest?.headers?.['Content-Type'] || originalRequest?.headers?.['content-type'])?.includes('multipart/form-data');

          if (shouldRetry && !isMultipart) {
            originalRequest._retryCount = originalRequest._retryCount || 0;
            if (originalRequest._retryCount < 2) {
              originalRequest._retryCount += 1;
              const base = 300 * Math.pow(2, originalRequest._retryCount - 1); // 300ms, 600ms
              const jitter = Math.floor(Math.random() * 200); // +0~200ms
              const delayMs = base + jitter;
              if (__DEV__) console.log(`[API] Retry #${originalRequest._retryCount} in ${delayMs}ms (status: ${status ?? 'network'})`);
              await new Promise((r) => setTimeout(r, delayMs));
              return this.client(originalRequest);
            }
          }
        } catch (_) {
          // fallthrough to error handling
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token!);
      }
    });
    this.failedQueue = [];
  }

  private async canRefresh(): Promise<boolean> {
    // authService를 통해 refreshToken 존재 확인
    const refreshToken = await authService.getRefreshToken();
    return !!refreshToken;
  }

  private async getAccessToken(): Promise<string | null> {
    // authService를 통해 accessToken 가져오기
    return await authService.getAccessToken();
  }

  private async refreshToken(): Promise<string> {
    // authService를 통해 토큰 재발급
    const newToken = await authService.refreshAccessToken();
    if (!newToken) {
      throw new Error('Token refresh failed');
    }
    return newToken;
  }

    private async redirectToAuthScreen(): Promise<void> {
      // 인증 화면(PIN/생체 인증)으로 리디렉션 처리(앱 내 네비게이션에서 처리할 수 있음)
      console.log('인증 화면으로 이동 필요: PIN/생체 인증');
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as any;
      const reqId = (error.config as any)?.requestId || (error.config as any)?.headers?.['X-Request-Id'];
      return {
        code: data?.errorCode || `HTTP_${error.response.status}`,
        message: data?.message || error.message,
        details: { ...(data || {}), requestId: reqId },
      };
    } else if (error.request) {
      const reqId = (error.config as any)?.requestId || (error.config as any)?.headers?.['X-Request-Id'];
      return {
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        details: { request: error.request, requestId: reqId },
      };
    } else {
      return {
        code: 'REQUEST_ERROR',
        message: error.message,
        details: error,
      };
    }
  }

  private parseOrReturn(method: string, response: AxiosResponse): any {
    let data: any = response.data;

    // 문자열인 경우 파싱을 시도
    if (typeof data === 'string') {
      if (data.trim() === '') {
        console.warn(`[API] ${method} 메서드에서 빈 문자열 응답 감지.`);
        // 시도: axios가 내부에 raw response를 남겼을 수 있음
        const raw = (response as any).request?._response || (response as any).request?._body || (response as any).request?.responseText;
        if (raw && typeof raw === 'string' && raw.trim() !== '') {
          try {
            const parsed = JSON.parse(raw);
            console.log(`[API] ${method} - 내부 raw 텍스트에서 JSON 파싱 성공`);
            data = parsed;
          } catch (e) {
            console.warn(`[API] ${method} - 내부 raw 텍스트 JSON 파싱 실패`);
          }
        }
        // 여전히 비어있다면 안전 래핑
        if (typeof data === 'string' && data.trim() === '') return { success: true, data: {} };
      }
      try {
        data = JSON.parse(data);
      } catch (parseError) {
        console.warn(`[API] ${method} JSON 파싱 실패, 원본 문자열을 data로 감싸 반환합니다.`);
        return { success: true, data };
      }
    }

    // 객체 형태이면 BaseResponse인지 확인하고 아니면 래핑
    if (data && typeof data === 'object') {
      if (Object.prototype.hasOwnProperty.call(data, 'success') && Object.prototype.hasOwnProperty.call(data, 'data')) {
        return data;
      }
      return { success: true, data };
    }

    // 그 외의 경우에도 안전하게 래핑
    return { success: true, data };
  }
  
  private async fetchViaNative<T>(method: string, url: string, data?: any, headers?: Record<string, string>, includeAuth: boolean = true): Promise<any> {
    const token = includeAuth ? await this.getAccessToken() : null;
    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers || {}),
    };
    if (token) finalHeaders.Authorization = `Bearer ${token}`;

    const opts: any = { method, headers: finalHeaders };
    if (data !== undefined) {
      if (data instanceof FormData) {
        // Let fetch set the multipart boundary header automatically
        delete finalHeaders['Content-Type'];
        opts.body = data as any;
      } else {
        opts.body = JSON.stringify(data);
      }
    }

    try {
      const debugHeaders = { ...finalHeaders } as any;
      if (debugHeaders.Authorization) debugHeaders.Authorization = 'Bearer ****';
      if (__DEV__) {
        console.log(`[API][fetch] ${method} ${url}`, this.sanitizePayload(data || {}));
        console.log('[API][fetch] request headers:', debugHeaders);
      }
      const res = await fetch(url, opts as RequestInit);
      
      // 응답 상태 로그 (dev only)
      if (__DEV__) {
        console.log(`[API][fetch] 응답 상태: ${res.status} ${res.statusText}`);
        console.log(`[API][fetch] 응답 헤더:`, Object.fromEntries(res.headers.entries()));
      }
      
      const text = await res.text();
      if (__DEV__) {
        console.log(`[API][fetch] 원본 응답 텍스트 길이:`, text?.length ?? 0);
      }
      
      if (!text || text.trim() === '') {
        console.warn(`[API][fetch] ${method} 메서드에서 빈 문자열 응답 감지.`);
        return { success: true, data: {} };
      }
      
      try {
        const json = JSON.parse(text);
        if (__DEV__) console.log(`[API][fetch] JSON 파싱 성공`);
        return json;
      } catch (e) {
        if (__DEV__) {
          console.warn(`[API][fetch] ${method} 응답 JSON 파싱 실패, 원본 텍스트 반환`);
          console.warn(`[API][fetch] 파싱 실패 원인:`, e);
        }
        return { success: true, data: text };
      }
    } catch (e) {
      console.error(`[API][fetch] ${method} ${url} 실패:`, e);
      throw e;
    }
  }
  
  async get<T>(url: string, params?: any): Promise<BaseResponse<T>> {
    if (USE_MSW) {
      // When using MSW/native, fetch tends to return proper body in RN environments.
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return this.fetchViaNative('GET', `${url}${query}`);
    }
    const response = await this.client.get(url, { params });
    return this.parseOrReturn('GET', response);
  }

  async post<T>(url: string, data?: any, config?: { headers?: Record<string, string> }): Promise<BaseResponse<T>> {
    if (USE_MSW) {
      return this.fetchViaNative('POST', url, data, config?.headers);
    }
    const response = await this.client.post(url, data, config);
    return this.parseOrReturn('POST', response);
  }

  async postWithConfig<T>(url: string, data?: any, config?: Record<string, any>): Promise<BaseResponse<T>> {
    if (USE_MSW) {
      const includeAuth = config?.skipAuth ? false : true;
      return this.fetchViaNative('POST', url, data, config?.headers, includeAuth);
    }
    const response = await this.client.post(url, data, config as any);
    return this.parseOrReturn('POST', response);
  }

  /**
   * 공통 헤더(Authorization, X-Device-Id) 없이 보내는 전용 POST
   *  - 1원 인증 요청/검증과 같이 비로그인, 무공통헤더 호출 전용
   */
  async postNoAuth<T>(url: string, data?: any): Promise<BaseResponse<T>> {
    const absoluteUrl = USE_MSW ? url : `${API_CONFIG.BASE_URL}${url}`;
    return this.fetchViaNative('POST', absoluteUrl, data, { 'Content-Type': 'application/json' }, false);
  }

  async put<T>(url: string, data?: any): Promise<BaseResponse<T>> {
    if (USE_MSW) {
      return this.fetchViaNative('PUT', url, data);
    }
    const response = await this.client.put(url, data);
    return this.parseOrReturn('PUT', response);
  }

  async patch<T>(url: string, data?: any): Promise<BaseResponse<T>> {
    if (USE_MSW) {
      return this.fetchViaNative('PATCH', url, data);
    }
    const response = await this.client.patch(url, data);
    return this.parseOrReturn('PATCH', response);
  }

  async delete<T>(url: string): Promise<BaseResponse<T>> {
    if (USE_MSW) {
      return this.fetchViaNative('DELETE', url);
    }
    const response = await this.client.delete(url);
    return this.parseOrReturn('DELETE', response);
  }

  async upload<T>(url: string, formData: FormData): Promise<BaseResponse<T>> {
    if (USE_MSW) {
      return this.fetchViaNative('POST', url, formData, { 'Content-Type': 'multipart/form-data' });
    }
    const response = await this.client.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // post 결과는 parseOrReturn로 감싸지 않으므로 수동으로 처리
    return this.parseOrReturn('UPLOAD', response);
  }
}

export const apiClient = new ApiClient();
