import { API_CONFIG } from '@/src/constants';
import { USE_MSW } from '@/src/constants/api';
import type { ApiError, BaseResponse } from '@/src/types';
import axios, { AxiosError, type AxiosInstance, type AxiosResponse } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (error: any) => void;
  }> = [];

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
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        try {
          const method = (config.method || 'get').toUpperCase();
          const fullUrl = `${config.baseURL || ''}${config.url}`;
          console.log(`[API] Request -> ${method} ${fullUrl}`, config.params || config.data || {});
        } catch (e) {}
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
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

  private async getAccessToken(): Promise<string | null> {
    return null;
  }

  private async refreshToken(): Promise<string> {
    throw new Error('Token refresh not implemented');
  }

  private async redirectToAuthScreen(): Promise<void> {
    console.log('Redirect to PIN/Biometric authentication screen');
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as any;
      return {
        code: data?.errorCode || `HTTP_${error.response.status}`,
        message: data?.message || error.message,
        details: data,
      };
    } else if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        details: error.request,
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
  
  private async fetchViaNative<T>(method: string, url: string, data?: any, headers?: Record<string, string>): Promise<any> {
    const token = await this.getAccessToken();
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
      console.log(`[API][fetch] ${method} ${url}`, data || {});
      const res = await fetch(url, opts as RequestInit);
      const text = await res.text();
      if (!text || text.trim() === '') {
        console.warn(`[API][fetch] ${method} 메서드에서 빈 문자열 응답 감지.`);
        return { success: true, data: {} };
      }
      try {
        const json = JSON.parse(text);
        return json;
      } catch (e) {
        console.warn(`[API][fetch] ${method} 응답 JSON 파싱 실패, 원본 텍스트 반환`);
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

  async post<T>(url: string, data?: any): Promise<BaseResponse<T>> {
    if (USE_MSW) {
      return this.fetchViaNative('POST', url, data);
    }
    const response = await this.client.post(url, data);
    return this.parseOrReturn('POST', response);
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