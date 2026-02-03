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
    } = useQuery<any>({
      queryKey: ['accounts', 'balance', accountId],
      queryFn: async () => {
        const result = await accountApi.getAccountBalance(accountId!);
        return result;
      },
      enabled: !!accountId,
      staleTime: 1 * 60 * 1000, // 1분간 캐시 유지
      select: (res) => {
        // MSW 응답 구조에 따른 유연한 처리
        let balance = null;
        
        // Case 1: { data: { balance: number } } - 표준 구조
        if (res && res.data && typeof res.data.balance === 'number') {
          balance = res.data.balance;
        }
        // Case 2: { balance: number } - 직접 구조 (MSW에서 직접 보내는 경우)
        else if (res && typeof res.balance === 'number') {
          balance = res.balance;
        }
        // Case 3: 빈 응답 또는 예상하지 못한 구조
        else {
          console.warn('[useAccountBalance] 예상하지 못한 응답 구조:', res);
          return null;
        }
        
        return { data: { balance } };
      },
    });

    // 실시간 잔액 업데이트 시 계좌 목록 캐시에서 해당 계좌 잔액만 업데이트
    useEffect(() => {
      if (data && accountId && data.data?.balance !== undefined) {
        // 계좌 목록 캐시에서 해당 계좌의 잔액만 업데이트
        queryClient.setQueryData(queryKeys.accounts.linked(), (oldData: any) => {
          if (!oldData) {
            return oldData;
          }
          
          // MSW 응답 구조에 따른 유연한 처리
          let accounts = [];
          
          // Case 1: { data: { accounts: [...] } } - 표준 구조
          if (oldData.data && oldData.data.accounts) {
            accounts = oldData.data.accounts;
          }
          // Case 2: { accounts: [...] } - 직접 구조 (MSW에서 직접 보내는 경우)
          else if (oldData.accounts) {
            accounts = oldData.accounts;
          }
          else {
            return oldData;
          }
          
          const updatedAccounts = accounts.map((account: any) => 
            account.accountId === accountId 
              ? { ...account, accountBalance: String(data.data.balance) }
              : account
          );
          
          // 원래 구조에 맞게 반환
          if (oldData.data && oldData.data.accounts) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                accounts: updatedAccounts
              }
            };
          } else {
            return {
              ...oldData,
              accounts: updatedAccounts
            };
          }
        });

        // 잔액 변경 시 해당 계좌의 슬롯 목록도 다시 조회
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.slots.byAccount(accountId) 
        });
      }
    }, [data, accountId, queryClient]);

    const balance = data?.data?.balance;

    if (isError && error) {
      console.error('[useAccountBalance] 에러 발생:', error.message);
    }

    return {
      balance,
      isLoading,
      isError,
      error,
      refetch,
    };
  };
