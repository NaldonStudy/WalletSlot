import { apiClient } from '@/src/api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
import {
    ApiError,
    BaseResponse,
    SlotDailySpendingResponse,
    SlotHistoryResponse,
    SlotsResponse
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
      // NOTE: `/daily-spending` endpoint was removed from backend spec.
      // If the backend provides an equivalent endpoint later, replace the URL here.
      // For now, return a safe default structure to avoid runtime crashes.
      console.warn('[slotApi] getSlotDailySpending: legacy endpoint removed; returning default empty payload');
      return {
        success: true,
        message: 'endpoint-removed',
        data: { startDate: '', transactions: [] }
      } as BaseResponse<SlotDailySpendingResponse>;
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
   * 슬롯 예산 변경 히스토리 조회
   */
  getSlotHistory: async (accountId: string, slotId: string): Promise<BaseResponse<SlotHistoryResponse>> => {
    try {
      return await apiClient.get<SlotHistoryResponse>(
        API_ENDPOINTS.ACCOUNT_SLOT_HISTORY(accountId, slotId)
      );
    } catch (error) {
      const apiError = error as ApiError | Error;
      const message =
        (apiError as ApiError)?.message ??
        (apiError as Error)?.message ??
        '슬롯 히스토리 조회에 실패했습니다.';

      console.error('[getSlotHistory] API 호출 실패:', {
        message,
        error: apiError,
        accountId,
        slotId,
        url: `/api/accounts/${accountId}/slots/${slotId}/history`
      });
      throw new Error(message);
    }
  },

};
