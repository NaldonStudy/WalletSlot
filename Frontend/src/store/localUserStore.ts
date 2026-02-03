import type { LocalUser } from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// 로컬 사용자 상태 타입 정의
type LocalUserState = {
  user: LocalUser | null;
  isLoggedIn: boolean;
};

// 액션 타입 정의
type LocalUserActions = {
  setUser: (user: LocalUser) => Promise<void>;
  setPushEnabled: (enabled: boolean) => Promise<void>;
  clearUser: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
};

// 전체 스토어 타입
type LocalUserStore = LocalUserState & LocalUserActions;

// 초기 상태
const initial: LocalUserState = {
  user: null,
  isLoggedIn: false,
};

// AsyncStorage 키
const STORAGE_KEYS = {
  USER_NAME: 'local_user_name',
  DEVICE_ID: 'local_device_id',
  PUSH_ENABLED: 'local_push_enabled',
  IS_LOGGED_IN: 'local_is_logged_in',
};

export const useLocalUserStore = create<LocalUserStore>((set, get) => ({
  ...initial,

  // 사용자 정보 설정 (회원가입 완료 시)
  setUser: async (user) => {
    try {
      // AsyncStorage에 저장
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, user.userName),
        AsyncStorage.setItem(STORAGE_KEYS.PUSH_ENABLED, user.isPushEnabled.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true'),
        // 옵션 필드들
        user.deviceId && AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, user.deviceId),
      ].filter(Boolean));

      // Zustand 상태 업데이트
      set({
        user,
        isLoggedIn: true,
      });

      console.log('✅ 로컬 사용자 정보 저장 완료:', {
        userName: user.userName,
        deviceId: user.deviceId,
        pushEnabled: user.isPushEnabled,
      });
    } catch (error) {
      console.error('❌ 로컬 사용자 정보 저장 실패:', error);
      throw error;
    }
  },

  // 알림 설정 변경
  setPushEnabled: async (enabled) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_ENABLED, enabled.toString());
      const currentUser = get().user;
      if (currentUser) {
        set({ 
          user: { ...currentUser, isPushEnabled: enabled },
          isLoggedIn: true 
        });
      }
      console.log('✅ 알림 설정 변경 완료:', enabled);
    } catch (error) {
      console.error('❌ 알림 설정 변경 실패:', error);
      throw error;
    }
  },

  // 사용자 정보 삭제 (로그아웃 시)
  clearUser: async () => {
    try {
      // AsyncStorage에서 삭제
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_NAME),
        AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_ID),
        AsyncStorage.removeItem(STORAGE_KEYS.PUSH_ENABLED),
        AsyncStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN),
      ]);

      // Zustand 상태 초기화
      set({ ...initial });

      console.log('✅ 로컬 사용자 정보 삭제 완료');
    } catch (error) {
      console.error('❌ 로컬 사용자 정보 삭제 실패:', error);
      throw error;
    }
  },

  // AsyncStorage에서 사용자 정보 로드 (앱 시작 시)
  loadFromStorage: async () => {
    try {
      const [
        userName,
        deviceId,
        pushEnabledStr,
        isLoggedInStr,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_NAME),
        AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID),
        AsyncStorage.getItem(STORAGE_KEYS.PUSH_ENABLED),
        AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
      ]);

      if (userName && isLoggedInStr === 'true') {
        const user: LocalUser = {
          userName,
          isPushEnabled: pushEnabledStr === 'true',
          deviceId: deviceId || undefined,
        };
        
        set({
          user,
          isLoggedIn: true,
        });
        console.log('✅ 로컬 사용자 정보 로드 완료');
      } else {
        console.log('📝 로컬 사용자 정보 없음 (로그인 필요)');
      }
    } catch (error) {
      console.error('❌ 로컬 사용자 정보 로드 실패:', error);
    }
  },
}));
