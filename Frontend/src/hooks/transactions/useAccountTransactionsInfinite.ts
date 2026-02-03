import { useInfiniteQuery } from "@tanstack/react-query";
import { transactionApi, queryKeys } from "@/src/api";
import type { AccountTransactionsResponse, BaseResponse } from "@/src/types";

/**
 * 계좌 전체 거래내역 무한 스크롤 조회 훅
 * 
 * @param accountId - 계좌 ID
 * @param limit - 페이지당 아이템 수 (기본값: 20)
 */
export const useAccountTransactionsInfinite = (
  accountId?: string,
  limit: number = 20
) => {
  return useInfiniteQuery<
    BaseResponse<AccountTransactionsResponse>,
    Error,
    AccountTransactionsResponse,
    any[]
  >({
    queryKey: accountId
      ? [...queryKeys.accounts.transactions(accountId), 'infinite']
      : ["accounts", "transactions", "infinite", "undefined"],
    queryFn: async ({ pageParam }) => {
      if (!accountId) {
        throw new Error("accountId가 필요합니다");
      }
      return await transactionApi.getAccountTransactions(accountId, {
        cursor: pageParam,
        limit,
      });
    },
    select: (data) => {
      // 모든 페이지의 거래내역을 하나의 배열로 합치기
      const allTransactions = data.pages.flatMap(page => page.data.transactions);
      const lastPage = data.pages[data.pages.length - 1];
      
      return {
        transactions: allTransactions,
        hasNext: lastPage?.data.hasNext || false,
        nextCursor: lastPage?.data.nextCursor || '',
        totalPages: data.pages.length,
      };
    },
    getNextPageParam: (lastPage) => {
      // hasNext가 true이고 nextCursor가 있으면 다음 페이지 파라미터 반환
      if (lastPage.data.hasNext && lastPage.data.nextCursor) {
        return lastPage.data.nextCursor;
      }
      return undefined; // 더 이상 페이지가 없음
    },
    enabled: !!accountId,
    staleTime: 1 * 60 * 1000, // 1분간 fresh 상태 유지
    gcTime: 5 * 60 * 1000,    // 5분간 캐시 유지
    initialPageParam: undefined, // 첫 페이지는 cursor 없이 시작
  });
};
