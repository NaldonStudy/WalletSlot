import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { notificationApi } from '@/src/api';
import { queryKeys } from '@/src/api/queryKeys';
import { notificationService } from '@/src/services/notificationService';
import type { 
  NotificationItem, 
  NotificationSettings, 
  PushTokenRequest 
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
    mutationFn: (notificationId: string) => 
      notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      // 알림 목록과 읽지 않은 개수 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

/**
 * 모든 알림 읽음 처리 뮤테이션
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      // 알림 목록과 읽지 않은 개수 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
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
 * 푸시 토큰 등록 뮤테이션
 */
export const useRegisterPushToken = () => {
  return useMutation({
    mutationFn: (data: PushTokenRequest) => 
      notificationApi.registerPushToken(data),
    onSuccess: () => {
      console.log('✅ 푸시 토큰 등록 완료');
    },
    onError: (error) => {
      console.error('❌ 푸시 토큰 등록 실패:', error);
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
    onSuccess: () => {
      // 알림 목록 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

/**
 * 푸시 알림 시스템 통합 관리 훅
 * 초기화, 토큰 등록, 앱 상태 감지를 한번에 처리
 */
export const usePushNotificationSystem = () => {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const registerPushTokenMutation = useRegisterPushToken();

  // 푸시 알림 시스템 초기화
  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        // 1. 알림 서비스 초기화
        const token = await notificationService.initialize();
        setPushToken(token);
        
        // 2. 서버에 토큰 등록
        if (token) {
          const tokenData = notificationService.getPushTokenData();
          if (tokenData) {
            registerPushTokenMutation.mutate(tokenData);
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('푸시 알림 초기화 실패:', error);
        setIsInitialized(false);
      }
    };

    initializePushNotifications();

    // 컴포넌트 언마운트 시 정리
    return () => {
      notificationService.cleanup();
    };
  }, []);

  // 앱 상태 감지
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('📱 앱 상태 변화:', appState, '→', nextAppState);
      
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('🔄 앱이 foreground로 돌아옴');
        // 배지 초기화
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
    registerPushToken: registerPushTokenMutation,
  };
};
