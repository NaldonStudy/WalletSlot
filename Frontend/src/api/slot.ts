import { apiClient } from '@/src/api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import {
  ApiError,
  BaseResponse,
  SlotDailySpendingResponse,
  SlotsResponse,
  SlotTransactionsResponse,
} from '@/src/types';

/**
 * 슬롯 관련 API 서비스
 */
export const slotApi = {
  /**
   * 계좌별 슬롯 목록 조회
   */
  getSlotsByAccount: async (accountId: string): Promise<BaseResponse<SlotsResponse>> => {
    try {
    return await apiClient.get<SlotsResponse>(API_ENDPOINTS.ACCOUNT_SLOTS(accountId));
    } catch (error) {
      console.error(
        '[getSlotsByAccount] API 호출 실패:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  },

  /**
   * 계좌별 슬롯 하루 지출 합계 (그래프 용도)
   */
  getSlotDailySpending: async (accountId: string, slotId: string): Promise<BaseResponse<SlotDailySpendingResponse>> => {
    try {
      return await apiClient.get<SlotDailySpendingResponse>(
        API_ENDPOINTS.ACCOUNT_SLOT_DAILY_SPENDING(accountId, slotId)
      );
    } catch (error) {
      const apiError = error as ApiError | Error;
      const message =
        (apiError as ApiError)?.message ??
        (apiError as Error)?.message ??
        '슬롯 하루 지출 합계 조회에 실패했습니다.';

      console.error('[getSlotDailySpending] API 호출 실패:', message, apiError);
      throw new Error(message);
    }
  },

  /**
   * 슬롯 거래내역 전체 조회
   */
  getSlotTransactions: async (
    accountId: string, 
    accountSlotId: string,
    params?: {
      page?: number;
      pageSize?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<BaseResponse<SlotTransactionsResponse>> => {
    try {
      return await apiClient.get<SlotTransactionsResponse>(
        API_ENDPOINTS.ACCOUNT_SLOT_TRANSACTIONS(accountId, accountSlotId),
        params
      );
    } catch (error) {
      console.error(
        '[getSlotTransactions] API 호출 실패:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  },

};
