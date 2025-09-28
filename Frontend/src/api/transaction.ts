import { apiClient } from '@/src/api/client';
import {
  SlotTransactionsResponse,
  MoveTransactionResponse,
  AccountTransactionsResponse,
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


  moveTransaction: async (
    accountId: string,
    transactionId: string,
    targetAccountSlotId: string
  ): Promise<MoveTransactionResponse> => {
    const url = `/api/accounts/${accountId}/transactions/${transactionId}`;
    const body = { accountSlotId: targetAccountSlotId };

    try {
      const res = await apiClient.patch<MoveTransactionResponse>(url, body);

      console.log('[transactionApi.moveTransaction] 응답:', res.data);

      if (!res.data.reassignedSlot || !res.data.transaction) {
        throw new Error("API 응답 데이터 구조가 올바르지 않습니다.");
      }

      return res.data;
    } catch (error: any) {
      console.error('[transactionApi.moveTransaction] 에러 상세:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },



  /**
   * 슬롯 거래내역 상세 조회
   */
  getTransactionDetail: async (
    accountId: string,
    accountSlotId: string,
    transactionId: string
  ): Promise<BaseResponse<{
    slot: {
      accountSlotId: string;
      name: string;
    };
    transaction: {
      transactionId: string;
      type: string;
      opponentAccountNo: string | null;
      summary: string;
      amount: number;
      balance: number;
      transactionAt: string;
    };
  }>> => {
    const url = `/api/accounts/${accountId}/slots/${accountSlotId}/transactions/${transactionId}`;

    console.log('[transactionApi.getTransactionDetail] 요청 정보:', {
      url,
      accountId,
      accountSlotId,
      transactionId
    });

    try {
      const result = await apiClient.get<{
        slot: { accountSlotId: string; name: string };
        transaction: {
          transactionId: string;
          type: string;
          opponentAccountNo: string | null;
          summary: string;
          amount: number;
          balance: number;
          transactionAt: string;
        };
      }>(url);

      console.log('[transactionApi.getTransactionDetail] 응답:', result);
      console.log('[transactionApi.getTransactionDetail] data:', result.data);

      if (!result.data?.slot || !result.data?.transaction) {
        throw new Error('API 응답 데이터 구조가 올바르지 않습니다.');
      }

      return result;

    } catch (error: any) {
      console.error('[transactionApi.getTransactionDetail] 에러 상세:', {
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
  },

  /**
   * 거래내역 나누기
   */
  splitTransaction: async (
    accountId: string,
    transactionId: string,
    splits: { accountSlotId: string; amount: number }[]
  ): Promise<BaseResponse<any>> => {
    const url = `/api/accounts/${accountId}/transactions/${transactionId}/splits`;
    const requestBody = { transactions: splits };

    console.log('[transactionApi.splitTransaction] 요청 정보:', {
      url,
      accountId,
      transactionId,
      requestBody
    });

    try {
      const result = await apiClient.post<BaseResponse<any>>(url, requestBody);
      console.log('[transactionApi.splitTransaction] 응답:', result);
      return result.data;
    } catch (error: any) {
      console.error('[transactionApi.splitTransaction] 에러 상세:', {
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
   * 계좌 전체 거래내역 조회
   */
  getAccountTransactions: async (
    accountId: string,
    params?: {
      cursor?: string;
      limit?: number;
    }
  ): Promise<BaseResponse<AccountTransactionsResponse>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.cursor) queryParams.append('cursor', params.cursor);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const url = `/api/accounts/${accountId}/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await apiClient.get<AccountTransactionsResponse>(url);
      return response;
    } catch (error: any) {
      console.error('[getAccountTransactions] API 호출 실패:', {
        accountId,
        params,
        error: error.message,
        status: error.response?.status,
        data: error.config?.data
      });
      throw error;
    }
  }
};
