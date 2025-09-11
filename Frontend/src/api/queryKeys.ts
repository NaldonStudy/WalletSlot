/**
 * React Query 키 관리
 * 중복 방지와 일관성을 위한 쿼리 키 정의
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
    balance: (accountId: number) => [...queryKeys.accounts.all, 'balance', accountId] as const,
    transactions: (accountId: number, filters?: any) => [...queryKeys.accounts.all, 'transactions', accountId, filters] as const,
  },

  // 슬롯 관련
  slots: {
    all: ['slots'] as const,
    list: () => [...queryKeys.slots.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.slots.all, 'detail', id] as const,
    recommendations: () => [...queryKeys.slots.all, 'recommendations'] as const,
    byAccount: (accountId: number) => [...queryKeys.slots.all, 'byAccount', accountId] as const,
  },

  // 알림 관련
  notifications: {
    all: ['notifications'] as const,
    list: (params?: any) => [...queryKeys.notifications.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.notifications.all, 'detail', id] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
    settings: () => [...queryKeys.notifications.all, 'settings'] as const,
  },
} as const;
