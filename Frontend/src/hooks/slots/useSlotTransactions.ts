import { useQuery } from "@tanstack/react-query";
import {slotApi, transactionApi, queryKeys } from "@/src/api";
import type { SlotTransaction } from "@/src/types";

/**
 * 슬롯 거래내역 조회 훅
 */
type UseSlotTransactionsOptions = {
  accountId: string;
  accountSlotId: string;
  params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  };
  enabled?: boolean;
};

export const useSlotTransactions = ({ 
  accountId, 
  accountSlotId, 
  params,
  enabled = true 
}: UseSlotTransactionsOptions) => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.slots.transactions(accountId, accountSlotId, params),
    queryFn: async () => {
      const result = await transactionApi.getSlotTransactions(accountId, accountSlotId, params);
      return result;
    },
    staleTime: 30 * 1000, // 30초간 fresh 상태 유지
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
    enabled: enabled && !!accountId && !!accountSlotId,
    // 캐시 무효화 시 자동으로 refetch
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    select: (res: any) => {
      // Case 1: 표준 구조 - res.data.transactions
      if (res && res.data && res.data.transactions) {
        return {
          transactions: res.data.transactions as SlotTransaction[],
          totalPages: res.data.totalPages || 1,
          totalItems: res.data.totalItems || 0,
          currentPage: res.data.currentPage || 1,
          pageSize: res.data.pageSize || 20,
        };
      }
      
      // Case 2: 직접 구조 - res.transactions (터미널 로그에서 보이는 구조)
      if (res && res.transactions && Array.isArray(res.transactions)) {
        return {
          transactions: res.transactions as SlotTransaction[],
          totalPages: res.totalPages || 1,
          totalItems: res.totalItems || 0,
          currentPage: res.currentPage || 1,
          pageSize: res.pageSize || 20,
        };
      }
      
      // Case 3: 빈 거래내역 응답 처리
      if (res && res.data && Array.isArray(res.data.transactions)) {
        return {
          transactions: res.data.transactions as SlotTransaction[],
          totalPages: res.data.totalPages || 1,
          totalItems: res.data.totalItems || 0,
          currentPage: res.data.currentPage || 1,
          pageSize: res.data.pageSize || 20,
        };
      }
      
      return {
        transactions: [],
        totalPages: 1,
        totalItems: 0,
        currentPage: 1,
        pageSize: 20,
      };
    },
  });

  if (isError && error) {
    console.error('[useSlotTransactions] 에러 발생:', error.message);
  }

  const result = {
    transactions: data?.transactions || [],
    totalPages: data?.totalPages || 1,
    totalItems: data?.totalItems || 0,
    currentPage: data?.currentPage || 1,
    pageSize: data?.pageSize || 20,
    isLoading,
    isError,
    error,
    refetch,
  };


  return result;
};
