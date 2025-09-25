import { apiClient } from '@/src/api/client';
import { 
  UserAccount, 
  AccountsResponse,
  Transaction, 
  TransactionCategory,
  PaginatedResponse,
  BaseResponse
} from '@/src/types';
import { isAmbiguousAxiosBody, fetchAccountsFallback, fetchAccountBalanceFallback, normalizeAccountList } from './responseNormalizer';

/**
 * 계좌 관련 API 서비스
 */
export const accountApi = {

  /**
   * 사용자 연동 계좌 목록 조회
   */
  getLinkedAccounts: async (): Promise<BaseResponse<AccountsResponse>> => {
    const res = await apiClient.get('/api/accounts/link');
    return normalizeAccountList(res);
  },

  /**
   * 계좌 잔액 조회
   */
  getAccountBalance: async (accountId: string): Promise<BaseResponse<{ balance: number }>> => {
    try {
      // Development Build에서 MSW 문제 해결을 위해 직접 fetch 사용
      const response = await fetch(`/api/accounts/${accountId}/balance`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as BaseResponse<{ balance: number }>;
    } catch (error) {
      try {
        // Fallback: 기존 axios 방식
        const res = await apiClient.get<BaseResponse<{ balance: number }>>(`/api/accounts/${accountId}/balance`);

        // MSW-Axios 호환성 문제 감지 및 fallback 처리
        if (isAmbiguousAxiosBody(res.data)) {
          const fallbackResult = await fetchAccountBalanceFallback(accountId);
          if (fallbackResult) {
            return fallbackResult;
          }
        }
        
        return res.data as BaseResponse<{ balance: number }>;
      } catch (axiosError) {
        console.error('[getAccountBalance] API 호출 실패:', axiosError instanceof Error ? axiosError.message : String(axiosError));
        throw axiosError;
      }
    }
  },

  /**
   * 마이데이터로 연동 가능한 계좌 목록 조회
   */
  getAvailableAccounts: async (): Promise<BaseResponse<UserAccount[]>> => {
    return apiClient.get('/accounts/available');
  },

  /**
   * 계좌 서비스 연동
   */
  linkAccounts: async (data: { accountIds: string[] }): Promise<BaseResponse<void>> => {
    return apiClient.post('/accounts/link', data);
  },

  /**
   * 대표계좌 설정
   */
  setMainAccount: async (accountId: string): Promise<BaseResponse<void>> => {
    return apiClient.post(`/accounts/${accountId}/set-main`);
  },

  /**
   * 계좌 상세 조회
   */
  getAccountDetail: async (accountId: string): Promise<BaseResponse<UserAccount>> => {
    return apiClient.get(`/accounts/${accountId}`);
  },


};

