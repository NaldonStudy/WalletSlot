import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { notificationApi } from '@/src/api';
import { queryKeys } from '@/src/api/queryKeys';
import { unifiedPushService } from '@/src/services';
import type { NotificationItem, NotificationSettings } from '@/src/types';

/**
 * 알림 목록 조회 훅
 */
export const useNotifications = (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationItem['type'];
}) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationApi.getNotifications(params),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * 읽지 않은 알림 개수 조회 훅
 */
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
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
 * 알림 읽음 처리 뮤테이션
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      const allQueries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.notifications.all });
      const previousSnapshots: Array<{ queryHash: string; data: any }> = [];
      
      allQueries.forEach(q => {
        const data: any = q.state.data;
        if (data && Array.isArray(data.data)) {
          previousSnapshots.push({ queryHash: q.queryHash, data: JSON.parse(JSON.stringify(data)) });
          const updated = {
            ...data,
            data: data.data.map((n: any) =>
              n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
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
        const query = queryClient.getQueryCache().get(s.queryHash)
        if (query) {
          queryClient.setQueryData(query.queryKey, s.data);
        }
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
 * 알림 안읽음 처리 뮤테이션
 */
export const useMarkNotificationAsUnread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsUnread(notificationId),
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      const allQueries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.notifications.all });
      const previousSnapshots: Array<{ queryHash: string; data: any }> = [];

      allQueries.forEach(q => {
        const data: any = q.state.data;
        if (data && Array.isArray(data.data)) {
          previousSnapshots.push({ queryHash: q.queryHash, data: JSON.parse(JSON.stringify(data)) });
          const updated = {
            ...data,
            data: data.data.map((n: any) =>
              n.id === notificationId ? { ...n, isRead: false, readAt: null } : n
            ),
          };
          queryClient.setQueryData(q.queryKey, updated);
        }
      });

      const unreadKey = queryKeys.notifications.unreadCount();
      const unread = queryClient.getQueryData<any>(unreadKey);
      if (unread?.data) {
        queryClient.setQueryData(unreadKey, { ...unread, data: { count: unread.data.count + 1 } });
      }
      return { previousSnapshots, unreadPrevious: unread };
    },
    onError: (_err, _id, ctx) => {
      ctx?.previousSnapshots.forEach(s => {
        const query = queryClient.getQueryCache().get(s.queryHash)
        if (query) {
          queryClient.setQueryData(query.queryKey, s.data);
        }
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
 * 모든 알림 읽음 처리 뮤테이션
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      const listQueries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.notifications.all });
      const previous: Array<{ queryKey: readonly unknown[]; data: any }> = [];
      
      listQueries.forEach(q => {
        const data: any = q.state.data;
        if (data && Array.isArray(data.data)) {
          previous.push({ queryKey: q.queryKey, data: JSON.parse(JSON.stringify(data)) });
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
 * 알림 삭제 뮤테이션
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationApi.deleteNotification(notificationId),
    onSuccess: (_res, notificationId) => {
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

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🔄 [HOOK] 푸시 서비스 초기화 시도...');
        const result = await unifiedPushService.initialize();
        if (result.success) {
          setIsInitialized(true);
          console.log('✅ [HOOK] 푸시 서비스 초기화 성공');
        } else {
          setIsInitialized(false);
          console.warn('⚠️ [HOOK] 푸시 서비스 초기화 실패');
        }
      } catch (error) {
        console.error('❌ [HOOK] 푸시 서비스 초기화 중 심각한 오류:', error);
        setIsInitialized(false);
      }
    };
    initialize();
    return () => {
      unifiedPushService.cleanup();
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