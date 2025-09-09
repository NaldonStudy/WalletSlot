import { QueryClient } from '@tanstack/react-query';
import { API_CONFIG } from '@/src/constants';

/**
 * React Query 클라이언트 설정
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데이터 캐싱 시간 (5분)
      staleTime: 5 * 60 * 1000,
      // 백그라운드에서 자동 리페치 간격 (10분)
      refetchInterval: 10 * 60 * 1000,
      // 윈도우 포커스시 리페치 비활성화 (모바일에서는 불필요)
      refetchOnWindowFocus: false,
      // 재시도 설정
      retry: (failureCount, error: any) => {
        // 401, 403 에러는 재시도하지 않음
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < API_CONFIG.RETRY_COUNT;
      },
      // 재시도 지연 시간 (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // 뮤테이션 재시도 설정
      retry: (failureCount, error: any) => {
        // 클라이언트 에러(4xx)는 재시도하지 않음
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

/**
 * 쿼리 키 팩토리
 * 일관된 쿼리 키 관리를 위한 헬퍼
 */
export const queryKeys = {
  // 사용자 관련
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    devices: () => [...queryKeys.user.all, 'devices'] as const,
  },
  
  // 계좌 관련
  accounts: {
    all: ['accounts'] as const,
    linked: () => [...queryKeys.accounts.all, 'linked'] as const,
    available: () => [...queryKeys.accounts.all, 'available'] as const,
    detail: (accountId: number) => [...queryKeys.accounts.all, 'detail', accountId] as const,
    balance: (accountId: number) => [...queryKeys.accounts.all, accountId, 'balance'] as const,
  },
  
  // 거래내역 관련
  transactions: {
    all: ['transactions'] as const,
    list: (params?: any) => [...queryKeys.transactions.all, 'list', params] as const,
    byAccount: (accountId: number, params?: any) => 
      [...queryKeys.transactions.all, 'account', accountId, params] as const,
    bySlot: (slotId: number, params?: any) => 
      [...queryKeys.transactions.all, 'slot', slotId, params] as const,
  },
  
  // 슬롯 관련
  slots: {
    all: ['slots'] as const,
    byAccount: (accountId: number) => [...queryKeys.slots.all, 'account', accountId] as const,
    detail: (slotId: number) => [...queryKeys.slots.all, 'detail', slotId] as const,
    history: (slotId: number) => [...queryKeys.slots.all, slotId, 'history'] as const,
    recommendations: {
      newUser: (params: any) => [...queryKeys.slots.all, 'recommendations', 'new-user', params] as const,
      fromHistory: (params: any) => [...queryKeys.slots.all, 'recommendations', 'from-history', params] as const,
      smart: (params: any) => [...queryKeys.slots.all, 'recommendations', 'smart', params] as const,
      nextMonth: (accountId: number) => [...queryKeys.slots.all, 'recommendations', 'next-month', accountId] as const,
    },
  },

  // 슬롯 카테고리 관련
  slotCategories: {
    all: ['slotCategories'] as const,
    list: () => [...queryKeys.slotCategories.all, 'list'] as const,
    default: () => [...queryKeys.slotCategories.all, 'default'] as const,
    detail: (categoryId: number) => [...queryKeys.slotCategories.all, 'detail', categoryId] as const,
  },

  // 거래 카테고리 관련
  transactionCategories: {
    all: ['transactionCategories'] as const,
    user: () => [...queryKeys.transactionCategories.all, 'user'] as const,
    common: () => [...queryKeys.transactionCategories.all, 'common'] as const,
  },
  
  // 알림 관련
  notifications: {
    all: ['notifications'] as const,
    list: (params?: any) => [...queryKeys.notifications.all, 'list', params] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
  },
  
  // AI 레포트 관련
  reports: {
    all: ['reports'] as const,
    monthly: (period: string) => [...queryKeys.reports.all, 'monthly', period] as const,
    insights: (reportId: number) => [...queryKeys.reports.all, 'insights', reportId] as const,
  },
  
  // 위시 아이템 관련
  wishItems: {
    all: ['wishItems'] as const,
    list: () => [...queryKeys.wishItems.all, 'list'] as const,
    detail: (wishItemId: number) => [...queryKeys.wishItems.all, 'detail', wishItemId] as const,
  },
} as const;
