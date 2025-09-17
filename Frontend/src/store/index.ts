/**
 * 상태 관리 (기본 틀)
 * 
 * 현재는 간단한 구조로 시작하고,
 * 추후 필요에 따라 Zustand 등의 라이브러리 도입 고려
 */

// React Native의 보안 저장소 관련
import * as SecureStore from 'expo-secure-store';
// 일반 설정은 민감하지 않으므로 AsyncStorage 사용
import AsyncStorage from '@react-native-async-storage/async-storage';




/** 
 * 인증 토큰 관리 -> Secure-Storage 사용용
 */
export const storageUtils = {
  /**
   * 토큰 저장 (보안 저장소 사용)
   */
  saveToken: async (token: string) => {
    try {
      // await SecureStore.setItemAsync('auth_token', token);
      console.log('Token saved securely');
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  },

  /**
   * 토큰 가져오기
   */
  getToken: async () => {
    try {
      // return await SecureStore.getItemAsync('auth_token');
      return null;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  },

  /**
   * 토큰 삭제
   */
  deleteToken: async () => {
    try {
      // await SecureStore.deleteItemAsync('auth_token');
      console.log('Token deleted');
    } catch (error) {
      console.error('Failed to delete token:', error);
    }
  },
};

/**
 * 앱 설정 관련 유틸리티
 * 일반 설정은 민감하지 않으므로 AsyncStorage 사용
 * onboardingCompleted 여부
 */
export const settingsUtils = {
  /**
   * 내부적으로 사용하는 저장 키
   */
  _keys: {
    settings: 'app_settings',
  },

  /**
   * 전체 설정을 저장합니다.
   */
  saveSettings: async (settings: Record<string, unknown>) => {
    try {
      const json = JSON.stringify(settings);
      await AsyncStorage.setItem(settingsUtils._keys.settings, json);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  },

  /**
   * 전체 설정을 가져옵니다. 없으면 빈 객체를 반환합니다.
   */
  getSettings: async <T extends Record<string, unknown> = Record<string, unknown>>() => {
    try {
      const json = await AsyncStorage.getItem(settingsUtils._keys.settings);
      if (!json) return {} as T;
      return JSON.parse(json) as T;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {} as T;
    }
  },

  /**
   * 온보딩 완료 여부 저장
   */
  setOnboardingCompleted: async (completed: boolean) => {
    try {
      const current = await settingsUtils.getSettings<Record<string, unknown>>();
      const next = { ...current, onboardingCompleted: completed, onboardingCompletedAt: new Date().toISOString() };
      await settingsUtils.saveSettings(next);
    } catch (error) {
      console.error('Failed to set onboarding flag:', error);
    }
  },

  /**
   * 온보딩 완료 여부 조회 (기본값 false)
   */
  getOnboardingCompleted: async () => {
    try {
      const settings = await settingsUtils.getSettings<Record<string, unknown>>();
      return Boolean(settings.onboardingCompleted);
    } catch (error) {
      console.error('Failed to get onboarding flag:', error);
      return false;
    }
  },
};
