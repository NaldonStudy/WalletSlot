import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { accountApi, queryKeys } from "@/src/api";
import type { BaseResponse } from "@/src/types";

interface BalanceResponse {
    balance: number;
}


/**
 * 특정 계좌 잔액 조회 훅
 */

export const useAccountBalance = (accountId?: string) => {
    
    const queryClient = useQueryClient();
    
    const {
      data,
      isLoading,
      isError,
      error,
      refetch,
    } = useQuery<BaseResponse<BalanceResponse> | null>({
      queryKey: ['accounts', 'balance', accountId],
      queryFn: () => {
        return accountApi.getAccountBalance(accountId!);
      },
      enabled: !!accountId,
      staleTime: 1 * 60 * 1000, // 1분간 캐시 유지
    });

    // 실시간 잔액 업데이트 시 계좌 목록 캐시에서 해당 계좌 잔액만 업데이트
    useEffect(() => {
      if (data && accountId && data.data?.balance !== undefined) {
        
        // 계좌 목록 캐시에서 해당 계좌의 잔액만 업데이트
        queryClient.setQueryData(queryKeys.accounts.linked(), (oldData: any) => {
          if (!oldData?.data?.accounts) return oldData;
          
          const updatedAccounts = oldData.data.accounts.map((account: any) => 
            account.accountId === accountId 
              ? { ...account, balance: data.data.balance }
              : account
          );
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              accounts: updatedAccounts
            }
          };
        });

        // 잔액 변경 시 해당 계좌의 슬롯 목록도 다시 조회
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.slots.byAccount(accountId) 
        });
      }
    }, [data, accountId, queryClient]);

    const balance = data?.data?.balance;

    return {
      balance,
      isLoading,
      isError,
      error,
      refetch,
    };
  };