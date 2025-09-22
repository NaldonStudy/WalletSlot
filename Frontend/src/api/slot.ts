import { apiClient } from '@/src/api/client';
import { 
  SlotData,
  SlotsResponse,
  SlotDailySpendingResponse,
  BaseResponse 
} from '@/src/types';
import { isAmbiguousAxiosBody, fetchSlotsFallback, fetchSlotDetailFallback, fetchSlotDailySpendingFallback } from './responseNormalizer';

/**
 * 슬롯 관련 API 서비스
 */
export const slotApi = {
  /**
   * 계좌별 슬롯 목록 조회
   */
  getSlotsByAccount: async (accountId: string): Promise<BaseResponse<SlotsResponse>> => {
    try {
      // Development Build에서 MSW 문제 해결을 위해 직접 fetch 사용
      const response = await fetch(`/api/accounts/${accountId}/slots`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as BaseResponse<SlotsResponse>;
    } catch (error) {
      try {
        // Fallback: 기존 axios 방식
        const res = await apiClient.get<BaseResponse<SlotsResponse>>(`/api/accounts/${accountId}/slots`);

        // MSW-Axios 호환성 문제 감지 및 fallback 처리
        if (isAmbiguousAxiosBody(res.data)) {
          const fallbackResult = await fetchSlotsFallback(accountId);
          if (fallbackResult) {
            return fallbackResult;
          }
        }
        
        return res.data as BaseResponse<SlotsResponse>;
      } catch (axiosError) {
        console.error('[getSlotsByAccount] API 호출 실패:', axiosError instanceof Error ? axiosError.message : String(axiosError));
        throw axiosError;
      }
    }
  },

  /**
   * 계좌별 슬롯 하루 지출 합계 (그래프 용도)
   */
  getSlotDailySpending: async (accountId: string, slotId: string): Promise<BaseResponse<SlotDailySpendingResponse>> => {
    try {
      // Development Build에서 MSW 문제 해결을 위해 직접 fetch 사용
      const response = await fetch(`/api/accounts/${accountId}/slots/${slotId}/daily-spending`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as BaseResponse<SlotDailySpendingResponse>;
    } catch (error) {
      try {
        // Fallback: 기존 axios 방식
        const res = await apiClient.get<BaseResponse<SlotDailySpendingResponse>>(`/api/accounts/${accountId}/slots/${slotId}/daily-spending`);

        // MSW-Axios 호환성 문제 감지 및 fallback 처리
        if (isAmbiguousAxiosBody(res.data)) {
          const fallbackResult = await fetchSlotDailySpendingFallback(accountId, slotId);
          if (fallbackResult) {
            return fallbackResult;
          }
        }
        
        return res.data as BaseResponse<SlotDailySpendingResponse>;
      } catch (axiosError) {
        console.error('[getSlotDailySpending] API 호출 실패:', axiosError instanceof Error ? axiosError.message : String(axiosError));
        throw axiosError;
      }
    }
  },

};
