import { useQuery } from "@tanstack/react-query";
import { accountApi, queryKeys } from "@/src/api";
import type { UserAccount, AccountsResponse, BaseResponse } from "@/src/types";

/**
 * 연동된 계좌 목록 조회 훅
 */
type UseLinkedAccountsOptions = {
    enabled?: boolean;
  };

export const useLinkedAccounts = ({ enabled = true }: UseLinkedAccountsOptions = {}) => {
  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<BaseResponse<AccountsResponse>, Error, UserAccount[]>({
    queryKey: queryKeys.accounts.linked(),
    queryFn: async () => {
      const result = await accountApi.getLinkedAccounts();
      return result;
    },
    staleTime: Infinity, // 무한으로 캐시 유지
    gcTime: Infinity, // 무한으로 캐시 유지
    enabled,
    select: (res) => {
      return res.data.accounts;
    },
  });

  return {
    accounts,
    isLoading,
    isError,
    error,
    refetch,
  };
};