
import { STORAGE_KEYS } from '@/src/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 앱 설정 관련 서비스
 * 온보딩, 테마, 언어 등 앱 전반적인 설정 관리
 */
export const appService = {
  /**
   * 온보딩 완료 여부 저장
   */
  setOnboardingCompleted: async (completed: boolean): Promise<void> => {
    try {
      const settings = {
        onboardingCompleted: completed,
        onboardingCompletedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, JSON.stringify(settings));
      console.log('[📱APP_SERVICE] ✅온보딩 완료 상태 저장:', completed);
    } catch (error) {
      console.error('[📱APP_SERVICE] ❌온보딩 완료 상태 저장 실패:', error);
      throw error;
    }
  },

  /**
   * 온보딩 완료 여부 조회 (기본값 false)
   */
  getOnboardingCompleted: async (): Promise<boolean> => {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
      if (!settingsData) return false; // 데이터가 없으면 false 반환 (온보딩 필요)
      
      const settings = JSON.parse(settingsData);
      return Boolean(settings.onboardingCompleted);
    } catch (error) {
      console.error('[📱APP_SERVICE] ❌온보딩 완료 상태 조회 실패:', error);
      return false; // 에러 시 false 반환 (온보딩 필요)
    }
  },

  /**
   * 온보딩 완료 시각 조회
   */
  getOnboardingCompletedAt: async (): Promise<string | null> => {
    try {
      const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
      if (!settingsData) return null;
      
      const settings = JSON.parse(settingsData);
      return settings.onboardingCompletedAt || null;
    } catch (error) {
      console.error('[📱APP_SERVICE] ❌온보딩 완료 시각 조회 실패:', error);
      return null;
    }
  },

  /**
   * 온보딩 상태 초기화 (디버그용)
   */
  resetOnboarding: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_DONE);
      console.log('[📱APP_SERVICE] ✅온보딩 상태 초기화 완료');
    } catch (error) {
      console.error('[📱APP_SERVICE] ❌온보딩 상태 초기화 실패:', error);
      throw error;
    }
  },
};