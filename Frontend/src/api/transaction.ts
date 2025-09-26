import { apiClient } from '@/src/api/client';
import { 
  SlotTransactionsResponse,
  MoveTransactionResponse,
  BaseResponse 
} from '@/src/types';
import { isAmbiguousAxiosBody } from './responseNormalizer';

/**
 * 거래내역 관련 API 서비스
 */
export const transactionApi = {
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
      // Development Build에서 MSW 문제 해결을 위해 직접 fetch 사용
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      
      const queryString = queryParams.toString();
      const url = `/api/accounts/${accountId}/slots/${accountSlotId}/transactions${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as BaseResponse<SlotTransactionsResponse>;
    } catch (error) {
      try {
        // Fallback: 기존 axios 방식
        const res = await apiClient.get<BaseResponse<SlotTransactionsResponse>>(
          `/api/accounts/${accountId}/slots/${accountSlotId}/transactions`,
          { params }
        );
        
        return res.data as BaseResponse<SlotTransactionsResponse>;
      } catch (axiosError) {
        console.error('[getSlotTransactions] API 호출 실패:', axiosError instanceof Error ? axiosError.message : String(axiosError));
        throw axiosError;
      }
    }
  },

  /**
   * 거래내역을 다른 슬롯으로 이동
   */
  moveTransaction: async (
    accountId: string,
    transactionId: string,
    targetAccountSlotId: string
  ): Promise<BaseResponse<MoveTransactionResponse>> => {
    const url = `/api/accounts/${accountId}/transactions/${transactionId}`;
    const body = { accountSlotId: targetAccountSlotId };
    
    console.log('[transactionApi.moveTransaction] 요청 정보:', {
      url,
      body,
      accountId,
      transactionId,
      targetAccountSlotId
    });
    
    try {
      const result = await apiClient.patch<BaseResponse<MoveTransactionResponse>>(url, body);
      console.log('[transactionApi.moveTransaction] 응답:', result);
      return result.data;
    } catch (error: any) {
      console.error('[transactionApi.moveTransaction] 에러 상세:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      throw error;
    }
  },

  /**
   * 더치페이 요청
   */
  requestDutchPay: async (
    accountId: string,
    transactionId: string,
    participantCount: number
  ): Promise<BaseResponse<any>> => {
    const url = `/api/accounts/${accountId}/transactions/${transactionId}/dutchpays?n=${participantCount}`;
    
    console.log('[transactionApi.requestDutchPay] 요청 정보:', {
      url,
      accountId,
      transactionId,
      participantCount
    });
    
    try {
      const result = await apiClient.post<BaseResponse<any>>(url);
      console.log('[transactionApi.requestDutchPay] 응답:', result);
      return result.data;
    } catch (error: any) {
      console.error('[transactionApi.requestDutchPay] 에러 상세:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      throw error;
    }
  }
};
