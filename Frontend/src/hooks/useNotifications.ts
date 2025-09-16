import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { notificationApi } from '@/src/api';
import { queryKeys } from '@/src/api/queryKeys';
import { notificationService } from '@/src/services/notificationService';
import type {
  NotificationItem,
  NotificationSettings
} from '@/src/types';

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
    staleTime: 30 * 1000, // 30초간 캐시 유지
    gcTime: 5 * 60 * 1000, // 5분간 가비지 컬렉션 방지
  });
};

/**
 * 읽지 않은 알림 개수 조회 훅
 */
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 10 * 1000, // 10초간 캐시 유지
    refetchInterval: 30 * 1000, // 30초마다 자동 새로고침
  });
};

/**
 * 알림 설정 조회 훅
 */
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: queryKeys.notifications.settings(),
    queryFn: () => notificationApi.getSettings(),
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
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
      const listKeyPrefix = queryKeys.notifications.all[0];
      const allQueries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.notifications.all });
      const previousSnapshots: Array<{ queryHash: string; data: any }> = [];
      await Promise.all(allQueries.map(async (q) => {
        const data: any = q.state.data;
        previousSnapshots.push({ queryHash: q.queryHash, data });
        if (data && Array.isArray(data.data)) {
          const updated = {
            ...data,
            data: data.data.map((n: any) => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
          };
          queryClient.setQueryData(q.queryKey, updated);
        }
      }));
      // unreadCount 캐시 조정
      const unreadKey = queryKeys.notifications.unreadCount();
      const unread = queryClient.getQueryData<any>(unreadKey);
      if (unread?.data?.count > 0) {
        queryClient.setQueryData(unreadKey, { ...unread, data: { count: unread.data.count - 1 } });
      }
      return { previousSnapshots, unreadPrevious: unread };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previousSnapshots) {
        ctx.previousSnapshots.forEach(s => {
          queryClient.setQueryData<any>(queryKeys.notifications.all, s.data); // coarse restore if needed
        });
      }
      if (ctx?.unreadPrevious) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), ctx.unreadPrevious);
      }
    },
    onSettled: () => {
      // 백그라운드 검증 한 번만 (active refetch X)
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(), refetchType: 'inactive' });
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
      const allQueries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.notifications.all });
      const previousSnapshots: Array<{ queryHash: string; data: any }> = [];
      await Promise.all(allQueries.map(async (q) => {
        const data: any = q.state.data;
        previousSnapshots.push({ queryHash: q.queryHash, data });
        if (data && Array.isArray(data.data)) {
          const updated = {
            ...data,
            data: data.data.map((n: any) => n.id === notificationId ? { ...n, isRead: false, readAt: null } : n)
          };
          queryClient.setQueryData(q.queryKey, updated);
        }
      }));
      // unreadCount 증가
      const unreadKey = queryKeys.notifications.unreadCount();
      const unread = queryClient.getQueryData<any>(unreadKey);
      if (unread?.data) {
        queryClient.setQueryData(unreadKey, { ...unread, data: { count: unread.data.count + 1 } });
      }
      return { previousSnapshots, unreadPrevious: unread };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previousSnapshots) {
        ctx.previousSnapshots.forEach(s => {
          queryClient.setQueryData<any>(queryKeys.notifications.all, s.data);
        });
      }
      if (ctx?.unreadPrevious) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), ctx.unreadPrevious);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(), refetchType: 'inactive' });
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
      const listQueries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.notifications.all });
      const previous: Array<{ queryKey: readonly unknown[]; data: any }> = [];
      listQueries.forEach(q => {
        const data: any = q.state.data;
        previous.push({ queryKey: q.queryKey, data });
        if (data && Array.isArray(data.data)) {
          const updated = { ...data, data: data.data.map((n: any) => ({ ...n, isRead: true })) };
          queryClient.setQueryData(q.queryKey, updated);
        }
      });
      // unreadCount 0으로 세팅
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
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount(), refetchType: 'inactive' });
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
      // 알림 설정 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.settings() });
    },
  });
};

/**
 * 알림 생성 뮤테이션
 */
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      message: string;
      type: NotificationItem['type'];
      slotId?: number;
      accountId?: number;
      pushData?: any;
    }) => notificationApi.createNotification(data),
    onSuccess: (res: any) => {
      const listQueries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.notifications.all });
      listQueries.forEach(q => {
        const data: any = q.state.data;
        if (data && Array.isArray(data.data) && res?.data) {
          queryClient.setQueryData(q.queryKey, { ...data, data: [res.data, ...data.data] });
        }
      });
      // unreadCount 증가 (새 알림은 기본 isRead:false 가정)
      const unreadKey = queryKeys.notifications.unreadCount();
      const unread = queryClient.getQueryData<any>(unreadKey);
      if (unread?.data) {
        queryClient.setQueryData(unreadKey, { ...unread, data: { count: unread.data.count + 1 } });
      }
      console.log('알림 생성 완료');
    },
    onError: (error) => {
      console.error('알림 생성 실패:', error);
    },
  });
};

/**
 * 미접속 알림 조회 뮤테이션
 */
export const usePullNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.pullNotifications(),
    onSuccess: () => {
      // 알림 목록 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      console.log('미접속 알림 조회 완료');
    },
    onError: (error) => {
      console.error('미접속 알림 조회 실패:', error);
    },
  });
};

/**
 * 알림 전송 처리 뮤테이션
 */
export const useMarkNotificationAsDelivered = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => 
      notificationApi.markAsDelivered(notificationId),
    onSuccess: () => {
      // 알림 목록 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error) => {
      console.error('알림 전송 처리 실패:', error);
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
      const listQueries = queryClient.getQueryCache().findAll({ queryKey: queryKeys.notifications.all });
      listQueries.forEach(q => {
        const data: any = q.state.data;
        if (data && Array.isArray(data.data)) {
          const removed = data.data.find((n: any) => n.id === notificationId);
          const updated = data.data.filter((n: any) => n.id !== notificationId);
          queryClient.setQueryData(q.queryKey, { ...data, data: updated });
          if (removed && !removed.isRead) {
            const unreadKey = queryKeys.notifications.unreadCount();
            const unread = queryClient.getQueryData<any>(unreadKey);
            if (unread?.data) {
              queryClient.setQueryData(unreadKey, { ...unread, data: { count: Math.max(0, unread.data.count - 1) } });
            }
          }
        }
      });
    },
  });
};

/**
 * 푸시 알림 시스템 통합 관리 훅
 */
export const usePushNotificationSystem = () => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        // TODO: 로그인 후 토큰 초기화 로직 구현
        const token = notificationService.getPushToken();
        setPushToken(token);
        setIsInitialized(true);
      } catch (error) {
        console.error('푸시 알림 초기화 실패:', error);
        setIsInitialized(false);
      }
    };

    initializePushNotifications();

    return () => {
      notificationService.cleanup();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        notificationService.setBadgeCount(0);
      }
      setAppState(nextAppState);
    });

    return () => subscription?.remove();
  }, [appState]);

  return {
    pushToken,
    appState,
    isInitialized,
    notificationService,
  };
};
