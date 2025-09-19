import { useQuery } from "@tanstack/react-query";
import { accountApi, queryKeys } from "@/src/api";
import type { BaseResponse } from "@/src/types";

interface BalanceResponse {
    balance: number;
}


/**
 * 특정 계좌 잔액 조회 훅
 */

export const useAccountBalance = (accountId?: string) => {
    const {
      data,
      isLoading,
      isError,
      error,
      refetch,
    } = useQuery<BaseResponse<BalanceResponse> | null>({
      queryKey: ['accounts', 'balance', accountId],
      queryFn: () => accountApi.getAccountBalance(accountId!),
      enabled: !!accountId,
      staleTime: 1 * 60 * 1000, // 1분간 캐시 유지
    });
  
    const balance = data?.data.balance;
  
    return {
      balance,
      isLoading,
      isError,
      error,
      refetch,
    };
  };