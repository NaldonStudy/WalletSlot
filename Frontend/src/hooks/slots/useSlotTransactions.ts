import { useQuery } from "@tanstack/react-query";
import { slotApi, queryKeys } from "@/src/api";
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
      console.log('[useSlotTransactions] API 호출 시작:', { accountId, accountSlotId, params });
      const result = await slotApi.getSlotTransactions(accountId, accountSlotId, params);
      console.log('[useSlotTransactions] API 응답:', result);
      return result;
    },
    staleTime: 0, // 항상 fresh 상태로 유지 (캐시 무시)
    gcTime: 0, // 캐시 사용 안함
    enabled: enabled && !!accountId && !!accountSlotId,
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

  // 디버깅용 로그 (임시)
  if (result.transactions.length > 0) {
    console.log('[useSlotTransactions] 거래내역 데이터:', result.transactions);
  }

  return result;
};
