/**
 * 상태 관리 (기본 틀)
 * 
 * 현재는 간단한 구조로 시작하고,
 * 추후 필요에 따라 Zustand 등의 라이브러리 도입 고려
 */

// React Native의 보안 저장소 관련
// import * as SecureStore from 'expo-secure-store';

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
 */
export const settingsUtils = {
  // 테마, 언어 등 일반 설정은 AsyncStorage 사용
  // 민감하지 않은 데이터
};
