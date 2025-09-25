import { apiClient } from '@/src/api/client';
import {
  ApiError,
  BaseResponse,
  SlotDailySpendingResponse,
  BaseResponse 
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
      return await apiClient.get<SlotsResponse>(`/api/accounts/${accountId}/slots`);
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
        `/api/accounts/${accountId}/slots/${slotId}/daily-spending`
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


};
