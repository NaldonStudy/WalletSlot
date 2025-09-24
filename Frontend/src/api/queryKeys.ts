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
    detail: (accountId: string) => [...queryKeys.accounts.all, 'detail', accountId] as const,
    balance: (accountId: string) => [...queryKeys.accounts.all, 'balance', accountId] as const,
    transactions: (accountId: string, filters?: any) => [...queryKeys.accounts.all, 'transactions', accountId, filters] as const,
  },

  // 슬롯 관련
  slots: {
    all: ['slots'] as const,
    list: () => [...queryKeys.slots.all, 'list'] as const,
    detail: (id: number) => [...queryKeys.slots.all, 'detail', id] as const,
    recommendations: () => [...queryKeys.slots.all, 'recommendations'] as const,
    byAccount: (accountId: string) => [...queryKeys.slots.all, 'byAccount', accountId] as const,
    dailySpending: (accountId: string, slotId: string) =>
      [...queryKeys.slots.all, 'dailySpending', accountId, slotId] as const,
  },

  // 알림 관련
  notifications: {
    all: ['notifications'] as const,
    list: (params?: any) => {
      if (!params) return [...queryKeys.notifications.all, 'list'] as const; // 안정적인 기본 키
      const norm: Record<string, any> = {};
      if (params.page != null) norm.page = params.page;
      if (params.limit != null) norm.limit = params.limit;
      if (params.unreadOnly) norm.unreadOnly = true;
      if (params.type && params.type !== 'all') norm.type = params.type;
      return [...queryKeys.notifications.all, 'list', norm] as const;
    },
    detail: (id: string) => [...queryKeys.notifications.all, 'detail', id] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
    settings: () => [...queryKeys.notifications.all, 'settings'] as const,
  },

  // 푸시 엔드포인트 관련
  pushEndpoints: {
    all: ['pushEndpoints'] as const,
    list: () => [...queryKeys.pushEndpoints.all, 'list'] as const,
    detail: (deviceId: string) => [...queryKeys.pushEndpoints.all, 'detail', deviceId] as const,
  },

  // 소비 레포트 관련
  reports: {
    all: ['reports'] as const,
    spending: () => [...queryKeys.reports.all, 'spending'] as const,
  },

  // 설정 관련
  settings: {
    all: ['settings'] as const,
    devices: () => [...queryKeys.settings.all, 'devices'] as const,
    linkedAccounts: () => [...queryKeys.settings.all, 'linkedAccounts'] as const,
  },
} as const;
