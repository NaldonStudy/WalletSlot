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
  getSlotDailySpending: async (accountId: string, accountSlotId: string): Promise<BaseResponse<SlotDailySpendingResponse>> => {
    try {
      console.log('[getSlotDailySpending] API 요청:', {
        accountId,
        accountSlotId,
        url: API_ENDPOINTS.ACCOUNT_SLOT_DAILY_SPENDING(accountId, accountSlotId)
      });
      
      const response = await apiClient.get<SlotDailySpendingResponse>(
        API_ENDPOINTS.ACCOUNT_SLOT_DAILY_SPENDING(accountId, accountSlotId)
      );
      
      console.log('[getSlotDailySpending] API 응답:', {
        success: response.success,
        message: response.message,
        data: response.data
      });
      
      // 날짜별 그룹화 및 합계 계산 (로그 없이)
      if (response.data && response.data.transactions) {
        const groupedByDate = response.data.transactions.reduce((acc, tx) => {
          if (acc[tx.date]) {
            acc[tx.date] += tx.spent;
          } else {
            acc[tx.date] = tx.spent;
          }
          return acc;
        }, {} as { [date: string]: number });
        
        const groupedTransactions = Object.entries(groupedByDate)
          .map(([date, spent]) => ({ date, spent }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        // 그룹화된 데이터로 응답 수정
        response.data.transactions = groupedTransactions;
      }
      
      return response;
    } catch (error) {
      const apiError = error as ApiError | Error;
      const message =
        (apiError as ApiError)?.message ??
        (apiError as Error)?.message ??
        '슬롯 하루 지출 합계 조회에 실패했습니다.';

      console.error('[getSlotDailySpending] API 호출 실패:', {
        message,
        error: apiError,
        accountId,
        accountSlotId
      });
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
