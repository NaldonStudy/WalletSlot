import { useEffect, useState } from 'react';

/**
 * 커스텀 훅 모음
 * 각 훅은 특정 도메인의 비즈니스 로직을 캡슐화
 */

// 인증 관련 (기본 틀)
export { useAuth } from './useAuth';

// 계좌 관련 
export { useAccounts } from './useAccount';
export { useAccountBalance } from './useAccountBalance';

// 슬롯 관련 (기본 틀)
export { useSlots, useSlotDetail } from './useSlots';

// 알림 관련
export {
  useDeleteNotification, useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useNotifications, useNotificationSettings, usePushNotificationSystem, useUnreadNotificationCount, useUpdateNotificationSettings
} from './useNotifications';

// 알림 화면 전용 훅
export { useNotificationLogic } from './useNotificationLogic';
export { useNotificationNavigation } from './useNotificationNavigation';

// 공통 유틸리티 훅
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useLocalStorage = (key: string, initialValue: any) => {
  // TODO: React Native 환경에서는 AsyncStorage 사용 필요
  // 현재는 기본값만 반환하는 템플릿
  const [storedValue, setStoredValue] = useState(initialValue);

  const setValue = (value: any) => {
    try {
      setStoredValue(value);
      // TODO: AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting storage:', error);
    }
  };

  return [storedValue, setValue];
};
