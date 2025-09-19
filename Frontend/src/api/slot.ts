import { apiClient } from '@/src/api/client';
import { 
  SlotData,
  SlotsResponse,
  BaseResponse 
} from '@/src/types';
import { isAmbiguousAxiosBody, fetchSlotsFallback, fetchSlotDetailFallback } from './responseNormalizer';

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
   * 슬롯 상세 조회
   */
  getSlotDetail: async (slotId: string): Promise<BaseResponse<SlotData>> => {
    try {
      // Development Build에서 MSW 문제 해결을 위해 직접 fetch 사용
      const response = await fetch(`/api/slots/${slotId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as BaseResponse<SlotData>;
    } catch (error) {
      try {
        // Fallback: 기존 axios 방식
        const res = await apiClient.get<BaseResponse<SlotData>>(`/api/slots/${slotId}`);

        // MSW-Axios 호환성 문제 감지 및 fallback 처리
        if (isAmbiguousAxiosBody(res.data)) {
          const fallbackResult = await fetchSlotDetailFallback(slotId);
          if (fallbackResult) {
            return fallbackResult;
          }
        }
        
        return res.data as BaseResponse<SlotData>;
      } catch (axiosError) {
        console.error('[getSlotDetail] API 호출 실패:', axiosError instanceof Error ? axiosError.message : String(axiosError));
        throw axiosError;
      }
    }
  },

  /**
   * 슬롯 예산 수정
   */
  updateSlotBudget: async (slotId: string, budget: number): Promise<BaseResponse<SlotData>> => {
    const res = await apiClient.put<BaseResponse<SlotData>>(`/api/slots/${slotId}/budget`, { budget });


    // MSW-Axios 호환성 문제 감지 및 fallback 처리
    if (isAmbiguousAxiosBody(res.data)) {
      // TODO: 슬롯용 fallback 함수 추가 필요
    }
    
    return res.data as BaseResponse<SlotData>;
  },
};
