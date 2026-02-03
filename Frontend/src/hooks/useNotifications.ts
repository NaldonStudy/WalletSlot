import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { notificationApi } from '@/src/api';
import { queryKeys } from '@/src/api/queryKeys';
import { unifiedPushService } from '@/src/services';
import type { NotificationItem, NotificationSettings } from '@/src/types';

/**
 * 알림 목록 조회 훅 (새로운 API 구조)
 */
export const useNotifications = (params?: {
  type?: 'SYSTEM' | 'DEVICE' | 'BUDGET' | 'TRANSACTION' | 'MARKETING';
  page?: number;
  size?: number;
  sort?: string[];
}) => {
  const baseParams = { ...(params || {}) } as {
    type?: 'SYSTEM' | 'DEVICE' | 'BUDGET' | 'TRANSACTION' | 'MARKETING';
    page?: number;
    size?: number;
    sort?: string[];
  };
  const startPage = typeof baseParams.page === 'number' ? baseParams.page : 0;
  const requestedSize = typeof baseParams.size === 'number' ? baseParams.size : undefined;
  // Query Key는 페이지를 포함하지 않음 (무한 스크롤에서 내부적으로 페이지 이동)
  const keyParams = { ...baseParams } as any;
  delete keyParams.page;

  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(keyParams),
    initialPageParam: startPage,
    queryFn: async ({ pageParam }) => {
      const res = await notificationApi.getNotifications({
        ...keyParams,
        page: typeof pageParam === 'number' ? pageParam : startPage,
        ...(requestedSize !== undefined ? { size: requestedSize } : {}),
      });
      return res;
    },
    getNextPageParam: (lastPage) => {
      const pg = (lastPage as any)?.data?.page;
      if (!pg) return undefined;
      const isLast = pg.last === true || (typeof pg.totalPages === 'number' && pg.number >= pg.totalPages - 1);
      return isLast ? undefined : (typeof pg.number === 'number' ? pg.number + 1 : undefined);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * 레거시 호환용 알림 목록 조회 훅
 */
export const useNotificationsLegacy = (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationItem['type'];
}) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationApi.getNotificationsLegacy(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * 미읽음 알림 개수 조회 훅
 */
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const response = await notificationApi.getUnreadCount();
      // API 응답을 기존 구조로 변환
      if (response.success && response.data) {
        return {
          success: true,
          data: { count: response.data.count },
          message: response.message
        };
      }
      return response;
    },
    // 인터벌 폴링 제거: 읽음 처리/모두 읽음/삭제/풀 등 관련 뮤테이션에서만 invalidate로 갱신
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

/**
 * 알림 설정 조회 훅
 */
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: queryKeys.notifications.settings(),
    queryFn: () => notificationApi.getSettings(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 알림 읽음 처리 뮤테이션 (notificationUuid 사용)
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationUuid: string) => notificationApi.markAsRead(notificationUuid),
    onMutate: async (notificationUuid: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      const allQueries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.notifications.all });
      const previousSnapshots: { queryKey: readonly unknown[]; data: any }[] = [];

      allQueries.forEach(q => {
        const data: any = q.state.data;
        if (!data) return;
        previousSnapshots.push({ queryKey: q.queryKey, data: JSON.parse(JSON.stringify(data)) });

        // Case 1: Infinite query shape { pages: [...], pageParams: [...] }
        if (Array.isArray(data.pages)) {
          const updated = {
            ...data,
            pages: data.pages.map((page: any) => {
              const pageData = page?.data;
              if (Array.isArray(pageData?.content)) {
                return {
                  ...page,
                  data: {
                    ...pageData,
                    content: pageData.content.map((n: any) =>
                      n.id === notificationUuid ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
                    ),
                  },
                };
              }
              if (Array.isArray(page?.data)) {
                return {
                  ...page,
                  data: page.data.map((n: any) =>
                    n.id === notificationUuid ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
                  ),
                };
              }
              return page;
            }),
          };
          queryClient.setQueryData(q.queryKey, updated);
          return;
        }

        // Case 2: Legacy flat list { data: [...] }
        if (Array.isArray(data.data)) {
          const updated = {
            ...data,
            data: data.data.map((n: any) =>
              n.id === notificationUuid ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
            ),
          };
          queryClient.setQueryData(q.queryKey, updated);
        }
      });

      const unreadKey = queryKeys.notifications.unreadCount();
      const unread = queryClient.getQueryData<any>(unreadKey);
      if (unread?.data?.count > 0) {
        queryClient.setQueryData(unreadKey, { ...unread, data: { count: unread.data.count - 1 } });
      }
      return { previousSnapshots, unreadPrevious: unread };
    },
    onError: (_err, _id, ctx) => {
      ctx?.previousSnapshots.forEach(s => {
        queryClient.setQueryData(s.queryKey, s.data);
      });
      if (ctx?.unreadPrevious) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), ctx.unreadPrevious);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    }
  });
};

/**
 * 알림 안읽음 처리 뮤테이션 (notificationUuid 사용)
 */
// 안읽음 전환 기능 제거됨: 서버 API 미제공에 따라 클라이언트 기능도 비활성화

/**
 * 모든 알림 읽음 처리 뮤테이션
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      const listQueries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.notifications.all });
      const previous: { queryKey: readonly unknown[]; data: any }[] = [];

      listQueries.forEach(q => {
        const data: any = q.state.data;
        if (!data) return;
        previous.push({ queryKey: q.queryKey, data: JSON.parse(JSON.stringify(data)) });

        if (Array.isArray(data.pages)) {
          const updated = {
            ...data,
            pages: data.pages.map((page: any) => {
              const pageData = page?.data;
              if (Array.isArray(pageData?.content)) {
                return {
                  ...page,
                  data: {
                    ...pageData,
                    content: pageData.content.map((n: any) => ({ ...n, isRead: true })),
                  },
                };
              }
              if (Array.isArray(page?.data)) {
                return {
                  ...page,
                  data: page.data.map((n: any) => ({ ...n, isRead: true })),
                };
              }
              return page;
            }),
          };
          queryClient.setQueryData(q.queryKey, updated);
          return;
        }

        if (Array.isArray(data.data)) {
          const updated = { ...data, data: data.data.map((n: any) => ({ ...n, isRead: true })) };
          queryClient.setQueryData(q.queryKey, updated);
        }
      });

      const unreadKey = queryKeys.notifications.unreadCount();
      const unreadPrev = queryClient.getQueryData<any>(unreadKey);
      if (unreadPrev) {
        queryClient.setQueryData(unreadKey, { ...unreadPrev, data: { count: 0 } });
      }
      return { previous, unreadPrev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach(p => queryClient.setQueryData(p.queryKey, p.data));
      if (ctx?.unreadPrev) queryClient.setQueryData(queryKeys.notifications.unreadCount(), ctx.unreadPrev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    }
  });
};

/**
 * 알림 설정 업데이트 뮤테이션
 */
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<NotificationSettings>) =>
      notificationApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.settings() });
    },
  });
};

/**
 * 알림 삭제 뮤테이션 (notificationUuid 사용)
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationUuid: string) =>
      notificationApi.deleteNotification(notificationUuid),
    onSuccess: (_res, notificationUuid) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
};

// ===== Push Endpoint Management Hooks =====

/**
 * 푸시 엔드포인트 등록/갱신 뮤테이션
 */
export const useRegisterPushEndpoint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.registerPushEndpoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pushEndpoints.list() });
    },
  });
};

/**
 * 푸시 엔드포인트 목록 조회 훅
 */
export const usePushEndpoints = () => {
  return useQuery({
    queryKey: queryKeys.pushEndpoints.list(),
    queryFn: () => notificationApi.getPushEndpoints(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 푸시 엔드포인트 업데이트 뮤테이션
 */
export const useUpdatePushEndpoint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, data }: { deviceId: string; data: any }) => 
      notificationApi.updatePushEndpoint(deviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pushEndpoints.list() });
    },
  });
};

/**
 * 푸시 엔드포인트 삭제 뮤테이션
 */
export const useDeletePushEndpoint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deviceId: string) => notificationApi.deletePushEndpoint(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pushEndpoints.list() });
    },
  });
};

/**
 * 미전송 알림 Pull 뮤테이션
 */
export const usePullNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.pullNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
};

/**
 * 푸시 알림 시스템 통합 관리 훅 (리팩토링됨)
 */
export const usePushNotificationSystem = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // 푸시 서비스는 알림 동의 화면에서만 초기화
  // (자동 초기화 제거 - 사용자가 알림을 허용했을 때만 FCM 토큰 발급)
  useEffect(() => {
    // 초기화 상태는 false로 유지 (알림 동의 후에만 true가 됨)
    setIsInitialized(false);
    
    return () => {
      // 정리 작업은 필요시에만 수행
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[HOOK] 앱이 활성화되어 배지 카운트를 초기화합니다.');
        unifiedPushService.setBadgeCount(0);
      }
      setAppState(nextAppState);
    });
    return () => subscription?.remove();
  }, [appState]);

  return {
    unifiedPushService,
    isInitialized,
  };
};