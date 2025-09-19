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
    const res = await apiClient.get<BaseResponse<SlotsResponse>>(`/api/accounts/${accountId}/slots`);


    // MSW-Axios 호환성 문제 감지 및 fallback 처리
    if (isAmbiguousAxiosBody(res.data)) {
      const fallbackResult = await fetchSlotsFallback(accountId);
      if (fallbackResult) {
        return fallbackResult;
      }
    }
    
    return res.data as BaseResponse<SlotsResponse>;
  },

  /**
   * 슬롯 상세 조회
   */
  getSlotDetail: async (slotId: string): Promise<BaseResponse<SlotData>> => {
    const res = await apiClient.get<BaseResponse<SlotData>>(`/api/slots/${slotId}`);


    // MSW-Axios 호환성 문제 감지 및 fallback 처리
    if (isAmbiguousAxiosBody(res.data)) {
      const fallbackResult = await fetchSlotDetailFallback(slotId);
      if (fallbackResult) {
        return fallbackResult;
      }
    }
    
    return res.data as BaseResponse<SlotData>;
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
