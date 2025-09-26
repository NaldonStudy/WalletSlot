import { accountApi, queryKeys } from "@/src/api";
import type { UserAccount } from "@/src/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

/**
 * 연동된 계좌 목록 조회 훅
 */
type UseLinkedAccountsOptions = {
    enabled?: boolean;
  };

export const useLinkedAccounts = ({ enabled = false }: UseLinkedAccountsOptions = {}) => {
  const queryClient = useQueryClient();
  const [isApiCompleted, setIsApiCompleted] = useState(false);
  
  // 컴포넌트 마운트 시 캐시 무효화 (enabled가 true일 때만) - 비활성화
  React.useEffect(() => {
    // if (enabled) {
    //   queryClient.invalidateQueries({ queryKey: queryKeys.accounts.linked() });
    // }
  }, [enabled]);
  
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
      setIsApiCompleted(true); // API 완료 시 true 설정
      return result;
    },
    staleTime: Infinity, // 무한으로 캐시 유지
    gcTime: Infinity, // 무한으로 캐시 유지
    enabled: enabled && !isApiCompleted, // API 완료되지 않았을 때만 실행
    select: (res) => {
      // normalizeAccountList가 모든 정규화를 처리하므로 단순히 accounts 반환
      return res?.data?.accounts || [];
    },
  });

  if (isError && error) {
    console.warn('[useLinkedAccounts] API 호출 실패:', error.message);
    // 에러를 콘솔 에러로 표시하지 않고 경고로만 표시
  }

  // 계좌 수정 후 캐시 무효화 함수
  const invalidateAccounts = () => {
    setIsApiCompleted(false); // API 완료 상태 초기화
    queryClient.invalidateQueries({ queryKey: queryKeys.accounts.linked() });
  };

  return {
    accounts: accounts || [],
    isLoading,
    isError,
    error,
    refetch,
    invalidateAccounts, // 계좌 수정 후 호출할 함수
    isApiCompleted, // API 완료 상태 노출
  };
};
