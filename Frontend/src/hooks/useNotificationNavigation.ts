/*
 * 🧭 알림 네비게이션 훅 - 알림 클릭 시 화면 이동 로직
 * 
 * 주요 기능:
 * - 알림 타입별 적절한 화면으로 이동
 * - expo-router와 React Navigation 호환성 지원
 * - 알림 클릭 시 자동 읽음 처리
 * - 네비게이션 이벤트 로깅
 * 
 * 네비게이션 매핑:
 * - budget_exceeded, goal_achieved: 대시보드 (슬롯 상세)
 * - spending_pattern: 대시보드
 * - account_sync: 프로필 (계좌 상세)
 * - system: 알림 화면
 * - 기타: pushData.targetScreen 사용
 * 
 * 호환성:
 * - expo-router 우선 사용 (있는 경우)
 * - React Navigation으로 fallback
 * - 최후 수단으로 Alert 표시
 * 
 * 에러 처리:
 * - 안전한 try-catch로 런타임 오류 방지
 * - 다양한 네비게이션 환경 대응
 */

import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { logNotificationOpened, monitoringService } from '@/src/services';
import type { NotificationItem } from '@/src/types';

// expo-router의 useRouter를 사용 가능하면 사용. 런타임에서 안전하게 확인
let tryUseExpoRouter: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const routerModule = require('expo-router');
  tryUseExpoRouter = routerModule.useRouter;
} catch (e) {
  tryUseExpoRouter = null;
}

export const useNotificationNavigation = () => {
  const navigation = useNavigation();

  const navigateTo = useCallback((path: string, params?: any) => {
    // expo-router 사용 가능 시 우선 사용
    try {
      if (tryUseExpoRouter) {
        const router = tryUseExpoRouter();
        router.push(path);
        return;
      }
    } catch (e) {
      // ignore and fallback
    }

    // React Navigation 방식으로 fallback
    try {
      // 경로가 expo-router 스타일('/(tabs)/dashboard')일 경우 간단 매핑으로 변환
      const pathStr: string = String(path || '');
      const routeMap: Record<string, string> = {
        '/(tabs)/dashboard': 'Dashboard',
        '/(tabs)/profile': 'Profile',
        '/(tabs)/notifications': 'Notifications',
        '/(tabs)/dashboard/slot': 'SlotDetail',
      };

      const matched = Object.keys(routeMap).find(k => pathStr.startsWith(k));
      if (matched) {
        // @ts-ignore
        navigation.navigate(routeMap[matched] as any, params);
      } else {
        // fallback: try raw navigate with path (may fail depending on navigator setup)
        // @ts-ignore
        navigation.navigate(path as any, params);
      }
    } catch (e) {
      // 최후의 수단: Alert로 정보 제공
      Alert.alert('네비게이션', `이동: ${path} params: ${JSON.stringify(params)}`);
    }
  }, [navigation]);

  const handleNotificationPress = useCallback((item: NotificationItem, onMarkAsRead: (item: NotificationItem) => void) => {
    // 알림 클릭 이벤트 로깅
    logNotificationOpened(item);
    monitoringService.logUserInteraction('button_click', {
      component: 'notification_item',
      notificationId: item.id,
      notificationType: item.type,
      wasRead: item.isRead
    });

    if (!item.isRead) {
      onMarkAsRead(item);
      
      monitoringService.logNotificationEvent('action_taken', {
        notificationId: item.id,
        type: item.type,
        action: 'mark_as_read'
      });
    }
    
    // 네비게이션 매핑: 타입별로 이동할 경로/파라미터 지정
    switch (item.type) {
      case 'budget_exceeded':
      case 'goal_achieved':
        if (item.slotId) navigateTo('/(tabs)/dashboard', { screen: 'SlotDetail', slotId: item.slotId });
        else navigateTo('/(tabs)/dashboard');
        break;
      case 'spending_pattern':
        navigateTo('/(tabs)/dashboard');
        break;
      case 'account_sync':
        if (item.accountId) navigateTo('/(tabs)/profile', { screen: 'AccountDetail', accountId: item.accountId });
        else navigateTo('/(tabs)/profile');
        break;
      case 'system':
        navigateTo('/(tabs)/notifications');
        break;
      default:
        // 푸시 데이터 내 targetScreen이 있으면 우선 사용
        if (item.pushData?.targetScreen) {
          navigateTo(item.pushData.targetScreen, item.pushData.params);
        }
        break;
    }
  }, [navigateTo]);

  const navigateToSettings = useCallback(() => {
    // expo-router 사용 가능 시 우선 사용
    try {
      if (tryUseExpoRouter) {
        const router = tryUseExpoRouter();
        router.push('/(tabs)/profile');
        return;
      }
    } catch (e) {
      // ignore and fallback
    }

    // React Navigation 방식으로 fallback
    try {
      // @ts-ignore
      navigation.navigate('Profile' as any);
    } catch (error) {
      console.log('알림 설정 페이지로 이동 실패:', error);
    }
  }, [navigation]);

  return {
    handleNotificationPress,
    navigateToSettings,
  };
};