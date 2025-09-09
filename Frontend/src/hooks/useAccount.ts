import { useQuery } from '@tanstack/react-query';
import { accountApi, queryKeys } from '@/src/api';
import type { Transaction, UserAccount } from '@/src/types';

interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
  page?: number;
  limit?: number;
}

/**
 * 계좌 관련 커스텀 훅
 * 연동 계좌 목록, 잔액 조회, 거래 내역 관리
 */
export const useAccount = (accountId?: number) => {
  // 연동된 계좌 목록 조회
  const { 
    data: linkedAccountsData, 
    isLoading: isAccountsLoading,
    refetch: refetchAccounts,
  } = useQuery({
    queryKey: queryKeys.accounts.linked(),
    queryFn: accountApi.getLinkedAccounts,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
  });

  // 특정 계좌 잔액 조회
  const { 
    data: balanceData, 
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: accountId ? queryKeys.accounts.balance(accountId) : ['accounts', 'balance', 'none'],
    queryFn: () => accountId ? accountApi.getAccountBalance(accountId) : Promise.resolve(null),
    enabled: !!accountId,
    staleTime: 1 * 60 * 1000, // 1분간 캐시 유지
  });

  const linkedAccounts = linkedAccountsData?.data || [];
  const mainAccount = linkedAccounts[0]; // 첫 번째 계좌를 주 계좌로 임시 처리
  const balance = balanceData?.data;

  return {
    // 계좌 관련
    linkedAccounts,
    mainAccount,
    isAccountsLoading,
    refetchAccounts,
    
    // 잔액 관련
    balance,
    isBalanceLoading,
    refetchBalance,
    
    // 포맷팅 유틸리티
    formatBalance: (amount?: number) => {
      if (amount === undefined) return '-';
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
      }).format(amount);
    },
  };
};

/**
 * 거래 내역 관련 커스텀 훅 (추후 API 완성 후 활성화)
 */
export const useTransactions = (accountId?: number, filters?: TransactionFilter) => {
  // TODO: API 메서드 완성 후 구현
  /*
  const { 
    data: transactionsData, 
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.accounts.transactions(accountId!, filters),
    queryFn: () => accountId ? accountApi.getAccountTransactions(accountId, filters) : Promise.resolve(null),
    enabled: !!accountId,
    staleTime: 30 * 1000, // 30초간 캐시 유지
  });
  */

  return {
    transactions: [],
    totalCount: 0,
    totalPages: 0,
    isLoading: false,
    error: null,
    refetch: () => {},
    
    // 유틸리티
    formatTransactionAmount: (transaction: Transaction) => {
      const amount = transaction.amount;
      const sign = transaction.type === 'income' ? '+' : '-';
      return `${sign}${new Intl.NumberFormat('ko-KR').format(amount)}원`;
    },
  };
};
