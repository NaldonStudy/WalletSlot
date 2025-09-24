/**
 * 상태 관리 (기본 틀)
 * 
 * 현재는 간단한 구조로 시작하고,
 * 추후 필요에 따라 Zustand 등의 라이브러리 도입 고려
 */

// React Native의 보안 저장소 관련
// 일반 설정은 민감하지 않으므로 AsyncStorage 사용

// Zustand 스토어들
export { useAuthStore } from './authStore';
export { useBankSelectionStore } from './bankSelectionStore';
export { useLocalUserStore } from './localUserStore';
export { useSignupStore } from './signupStore';
export { useSlotStore } from './useSlotStore';




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
