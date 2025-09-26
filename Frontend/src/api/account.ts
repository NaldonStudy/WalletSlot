import { apiClient } from '@/src/api/client';
import {
  AccountsResponse,
  BaseResponse,
  UserAccount
} from '@/src/types';
import { fetchAccountBalanceFallback, isAmbiguousAxiosBody, normalizeAccountList } from './responseNormalizer';

/**
 * 계좌 관련 API 서비스
 */
export const accountApi = {

  /**
   * 사용자 연동 계좌 목록 조회
   */
  getLinkedAccounts: async (): Promise<BaseResponse<AccountsResponse>> => {
    const res = await apiClient.post('/api/accounts/link', {});
    return normalizeAccountList(res);
  },

  /**
   * 계좌 잔액 조회
   */
  getAccountBalance: async (accountId: string): Promise<BaseResponse<{ balance: number }>> => {
    try {
      const res = await apiClient.get<{ balance: number }>(`/api/accounts/${accountId}/balance`);
      if (isAmbiguousAxiosBody((res as any)?.data)) {
        const fallbackResult = await fetchAccountBalanceFallback(accountId);
        if (fallbackResult) {
          return fallbackResult;
        }
      }
      return res;
    } catch (error) {
      console.error('[getAccountBalance] API 호출 실패:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  },


  /**
   * 계좌 서비스 연동
   */
  linkAccounts: async (data: { accountIds: string[] }): Promise<BaseResponse<void>> => {
    return apiClient.post('/api/accounts/link', data);
  },

  /**
   * 대표계좌 설정
   */
  setMainAccount: async (accountId: string, body: { alias?: string; isPrimary?: boolean }): Promise<BaseResponse<void>> => {
    return apiClient.patch(`/api/accounts/${accountId}`, body);
  },

  /**
   * 계좌 상세 조회
   */
  getAccountDetail: async (accountId: string): Promise<BaseResponse<UserAccount>> => {
    return apiClient.get(`/api/accounts/${accountId}`);
  },


};

