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

// expo-router 직접 import (동적 로딩 대신)
import { useRouter } from 'expo-router';

export const useNotificationNavigation = () => {
  const navigation = useNavigation();
  const router = useRouter(); // expo-router 직접 사용

  const navigateTo = useCallback((path: string, params?: any) => {
    console.log('[Navigation] 네비게이션 시도:', { path, params });
    
    // expo-router 우선 사용
    try {
      console.log('[Navigation] expo-router로 이동:', path);
      
      // 쿼리 파라미터 처리
      if (path.includes('?')) {
        const [basePath, queryString] = path.split('?');
        const searchParams = new URLSearchParams(queryString);
        const paramObj: any = {};
        searchParams.forEach((value, key) => {
          paramObj[key] = value;
        });
        
        console.log('[Navigation] 파라미터와 함께 이동:', { basePath, paramObj });
        
        // expo-router에서는 pathname과 params를 분리해서 전달
        router.push({
          pathname: basePath as any,
          params: paramObj
        });
      } else {
        router.push(path as any);
      }
      return;
    } catch (e) {
      console.log('[Navigation] expo-router 실패:', e);
    }

    // React Navigation Fallback (expo-router가 실패한 경우)
    try {
      console.log('[Navigation] React Navigation fallback 시도');
      
      // expo-router 스타일 경로를 React Navigation이 이해할 수 있는 형태로 변환
      const pathStr: string = String(path || '');
      const [basePath, queryString] = pathStr.split('?');
      const queryParams = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};
      
      // 정확한 route 이름 매핑 (expo-router 탭 구조 기반)
      if (basePath === '/(tabs)/dashboard') {
        // @ts-ignore - dashboard 탭으로 이동
        navigation.navigate('dashboard' as any, queryParams);
      } else if (basePath === '/(tabs)/profile') {
        // @ts-ignore
        navigation.navigate('profile' as any, queryParams);
      } else if (basePath === '/(tabs)/notifications') {
        // @ts-ignore  
        navigation.navigate('notifications' as any, queryParams);
      } else {
        // 기본값: dashboard로 이동
        // @ts-ignore
        navigation.navigate('dashboard' as any, queryParams);
      }
      
      console.log('[Navigation] React Navigation으로 이동 성공');
      
    } catch (e) {
      console.error('[Navigation] React Navigation도 실패:', e);
      Alert.alert(
        '네비게이션 오류',
        '해당 화면으로 이동할 수 없습니다.\n수동으로 대시보드를 확인해주세요.',
        [{ text: '확인' }]
      );
    }
  }, [router, navigation]);

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
    console.log('[Navigation] 알림 네비게이션 처리:', { type: item.type, slotId: item.slotId, accountId: item.accountId, transactionId: item.transactionId });
    
    switch (item.type) {
      case 'BUDGET':
        // 예산 관련 알림 -> 슬롯 중심의 네비게이션
        console.log('[Navigation] BUDGET 알림 처리');
        if (item.slotId && item.accountId) {
          // 계좌와 슬롯 정보가 모두 있는 경우 - 특정 슬롯 하이라이트
          navigateTo(`/(tabs)/dashboard?accountId=${item.accountId}&highlightSlot=${item.slotId}`);
        } else if (item.slotId) {
          // 슬롯 정보만 있는 경우
          navigateTo(`/(tabs)/dashboard?highlightSlot=${item.slotId}`);
        } else {
          // 슬롯 정보가 없으면 기본 대시보드로
          console.log('[Navigation] 슬롯 정보 없음, 기본 대시보드로 이동');
          navigateTo('/(tabs)/dashboard');
        }
        break;
        
      case 'TRANSACTION':
        // 거래 관련 알림 -> 거래 중심의 네비게이션
        console.log('[Navigation] TRANSACTION 알림 처리');
        if (item.transactionId) {
          // 거래 ID가 있는 경우 - 거래 하이라이트 (슬롯 정보는 추가 컨텍스트)
          const queryParams = [`highlightTransaction=${item.transactionId}`];
          if (item.accountId) queryParams.push(`accountId=${item.accountId}`);
          if (item.slotId) queryParams.push(`slotId=${item.slotId}`);
          navigateTo(`/(tabs)/dashboard?${queryParams.join('&')}`);
        } else if (item.slotId && item.accountId) {
          // 거래 ID는 없지만 슬롯 정보가 있는 경우 - 해당 슬롯으로
          console.log('[Navigation] 거래 ID 없음, 관련 슬롯으로 이동');
          navigateTo(`/(tabs)/dashboard?accountId=${item.accountId}&highlightSlot=${item.slotId}`);
        } else {
          // 연결 정보가 없으면 기본 대시보드로
          console.log('[Navigation] 거래/슬롯 정보 없음, 기본 대시보드로 이동');
          navigateTo('/(tabs)/dashboard');
        }
        break;
        
      case 'SYSTEM':
      case 'DEVICE':  
      case 'MARKETING':
        // 네비게이션이 없는 알림들 -> 모달로 상세 내용 표시
        console.log('[Navigation] 모달 표시 알림:', item.type);
        Alert.alert(
          item.title,
          item.message,
          [
            { 
              text: '확인', 
              style: 'default',
              onPress: () => {
                console.log('[Navigation] 모달 닫힘');
                monitoringService.logNotificationEvent('action_taken', {
                  notificationId: item.id,
                  type: item.type,
                  action: 'modal_dismissed'
                });
              }
            }
          ]
        );
        break;
        
      default:
        // 알 수 없는 타입의 알림 처리
        console.log('[Navigation] 알 수 없는 알림 타입:', item.type);
        if (item.pushData?.targetScreen) {
          // 푸시 데이터 내 targetScreen이 있으면 우선 사용
          console.log('[Navigation] pushData의 targetScreen 사용:', item.pushData.targetScreen);
          navigateTo(item.pushData.targetScreen, item.pushData.params);
        } else {
          // 기본값: 모달로 내용 표시
          console.log('[Navigation] 기본 모달 표시');
          Alert.alert(
            item.title,
            item.message,
            [
              { 
                text: '확인', 
                onPress: () => {
                  console.log('[Navigation] 기본 모달 닫힘');
                }
              }
            ]
          );
        }
        break;
    }
  }, [navigateTo]);

  const navigateToSettings = useCallback(() => {
    try {
      console.log('[Navigation] 설정 페이지로 이동');
      router.push('/(tabs)/profile');
    } catch (error) {
      console.log('[Navigation] 설정 페이지로 이동 실패:', error);
      // fallback
      try {
        // @ts-ignore
        navigation.navigate('profile' as any);
      } catch (fallbackError) {
        console.log('[Navigation] 설정 페이지 fallback도 실패:', fallbackError);
      }
    }
  }, [router, navigation]);

  return {
    handleNotificationPress,
    navigateToSettings,
  };
};