import { useQuery } from "@tanstack/react-query";
import { transactionApi, queryKeys } from "@/src/api";
import type { AccountTransactionsResponse, BaseResponse } from "@/src/types";

/**
 * 계좌 전체 거래내역 조회 훅
 * 
 * @param accountId - 계좌 ID
 * @param params - 조회 파라미터 (cursor, limit)
 */
export const useAccountTransactions = (
  accountId?: string,
  params?: {
    cursor?: string;
    limit?: number;
  }
) => {
  return useQuery<
    BaseResponse<AccountTransactionsResponse>,
    Error,
    AccountTransactionsResponse
  >({
    queryKey: accountId
      ? queryKeys.accounts.transactions(accountId, params)
      : ["accounts", "transactions", "undefined"],
    queryFn: async () => {
      if (!accountId) {
        throw new Error("accountId가 필요합니다");
      }
      return await transactionApi.getAccountTransactions(accountId, params);
    },
    select: (res) => res.data,
    enabled: !!accountId,
    staleTime: 1 * 60 * 1000, // 1분간 fresh 상태 유지
    gcTime: 5 * 60 * 1000,    // 5분간 캐시 유지
  });
};
