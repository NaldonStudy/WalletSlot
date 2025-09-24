import { useQuery, useQueryClient } from "@tanstack/react-query";
import { accountApi, queryKeys } from "@/src/api";
import type { UserAccount, AccountsResponse, BaseResponse } from "@/src/types";

/**
 * 연동된 계좌 목록 조회 훅
 */
type UseLinkedAccountsOptions = {
    enabled?: boolean;
  };

export const useLinkedAccounts = ({ enabled = true }: UseLinkedAccountsOptions = {}) => {
  const queryClient = useQueryClient();
  
  const {
    data: accounts,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<any, Error, UserAccount[]>({
    queryKey: queryKeys.accounts.linked(),
    queryFn: async () => {
      const result = await accountApi.getLinkedAccounts();
      return result;
    },
    staleTime: Infinity, // 무한으로 캐시 유지
    gcTime: Infinity, // 무한으로 캐시 유지
    enabled,
    select: (res) => {
      // MSW 응답 구조에 따른 유연한 처리
      let accounts = [];
      
      // Case 1: { data: { accounts: [...] } } - 표준 구조
      if (res && res.data && res.data.accounts) {
        accounts = res.data.accounts;
      }
      // Case 2: { accounts: [...] } - 직접 구조 (MSW에서 직접 보내는 경우)
      else if (res && res.accounts) {
        accounts = res.accounts;
      }
      // Case 3: 빈 응답 또는 예상하지 못한 구조
      else {
        console.warn('[useLinkedAccounts] 예상하지 못한 응답 구조:', res);
        return [];
      }
      
      return accounts;
    },
  });

  if (isError && error) {
    console.error('[useLinkedAccounts] 에러 발생:', error.message);
  }

  // 계좌 수정 후 캐시 무효화 함수
  const invalidateAccounts = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.accounts.linked() });
  };

  return {
    accounts: accounts || [],
    isLoading,
    isError,
    error,
    refetch,
    invalidateAccounts, // 계좌 수정 후 호출할 함수
  };
};
