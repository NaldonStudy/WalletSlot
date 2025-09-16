import { API_CONFIG } from '@/src/constants';
import { USE_MSW } from '@/src/constants/api';
import { ApiError, BaseResponse } from '@/src/types';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

/**
 * API 클라이언트 클래스
 * 인터셉터를 통한 토큰 관리, 에러 처리, 재시도 로직 포함
 */
class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: string) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    // MSW 사용 시에는 MSW가 가로챌 수 있는 실제 도메인 사용
    // 개발환경: MSW가 모든 요청을 가로채는 도메인
    // 배포환경: 실제 서버 URL
  // MSW 활성화 시 실제 네트워크 호출을 피하기 위해 상대 경로 사용
  // (절대 도메인 기반 핸들러 제거했으므로 상대 경로가 필수)
  const baseURL = USE_MSW ? '' : API_CONFIG.BASE_URL;
    
    this.client = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 요청 인터셉터 - 토큰 자동 첨부
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        try {
          const method = (config.method || 'get').toUpperCase();
          const fullUrl = `${config.baseURL || ''}${config.url}`;
          // Friendly debug log to see outgoing requests and params
          // eslint-disable-next-line no-console
          console.log(`[API] Request -> ${method} ${fullUrl}`, config.params || config.data || {});
        } catch (e) {
          // ignore logging errors
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터 - 토큰 갱신 및 에러 처리
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
            // 토큰 갱신 실패 시 PIN/생체인증 화면으로 이동
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
    // TODO: SecureStore에서 토큰 가져오기
    // import * as SecureStore from 'expo-secure-store';
    // return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKENS);
    return null;
  }

  private async refreshToken(): Promise<string> {
    // TODO: 리프레시 토큰으로 새 액세스 토큰 획득
    throw new Error('Token refresh not implemented');
  }

  private async redirectToAuthScreen(): Promise<void> {
    // TODO: PIN/생체인증 화면으로 이동
    // 로그아웃이 아닌 재인증을 위한 화면 전환
    console.log('Redirect to PIN/Biometric authentication screen');
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // 서버에서 응답을 받았지만 상태 코드가 2xx가 아님
      const data = error.response.data as any;
      return {
        code: data?.errorCode || `HTTP_${error.response.status}`,
        message: data?.message || error.message,
        details: data,
      };
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      return {
        code: 'NETWORK_ERROR',
        message: '네트워크 연결을 확인해주세요.',
        details: error.request,
      };
    } else {
      // 요청 설정 중 오류 발생
      return {
        code: 'REQUEST_ERROR',
        message: error.message,
        details: error,
      };
    }
  }

  // 공통 API 메서드들
  async get<T>(url: string, params?: any): Promise<BaseResponse<T>> {
    const response = await this.client.get(url, { params });
    try {
      console.log('[API][raw axios response] status:', response.status, 'keys:', Object.keys(response || {}));
      console.log('[API][raw axios response] data type:', typeof response.data, Array.isArray(response.data) ? 'array' : 'not-array');
      if (response.data && typeof response.data === 'object') {
        console.log('[API][raw axios response] data keys:', Object.keys(response.data));
      } else {
        console.log('[API][raw axios response] data value preview:', String(response.data).slice(0, 120));
      }
    } catch {}
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<BaseResponse<T>> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<BaseResponse<T>> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<BaseResponse<T>> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<BaseResponse<T>> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // 파일 업로드를 위한 메서드
  async upload<T>(url: string, formData: FormData): Promise<BaseResponse<T>> {
    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
