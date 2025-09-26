import { queryClient } from '@/src/api/queryClient';
import { authService } from '@/src/services/authService';
import type { LocalUser } from '@/src/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  // 상태
  user: LocalUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  
  // 액션들
  login: (response: Response) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  refreshAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      isLoggedIn: false,
      isLoading: true,

      // 로그인 (서버 응답에서 자동으로 데이터 저장)
      login: async (response: Response) => {
        try {
          set({ isLoading: true });
          
          // authService를 통해 모든 데이터 저장 (사용자, 토큰, 알림 설정)
          await authService.saveLoginData(response);
          
          // 저장된 사용자 정보 조회
          const user = await authService.getUser();
          const isLoggedIn = await authService.isLoggedIn();
          
          set({ 
            user, 
            isLoggedIn, 
            isLoading: false 
          });
          
          // 푸시 서비스 초기화 제거! (이미 saveLoginData에서 처리됨)
          
          console.log('[🔐AUTH_STORE] ✅로그인 완료:', user?.userName);
        } catch (error) {
          console.error('[🔐AUTH_STORE] ❌로그인 실패:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // 로그아웃
      logout: async () => {
        try {
          set({ isLoading: true });
          
          // authService를 통해 모든 데이터 삭제
          await authService.clearAll();

          // React Query 캐시 초기화 (사용 중인 경우 안전하게 전체 초기화)
          try {
            await queryClient.clear();
          } catch (e) {
            console.warn('[🔐AUTH_STORE] React Query clear skip:', e);
          }

          // 사용자 종속 Zustand 스토어 초기화 (존재 시 안전 호출)
          try {
            const { useLocalUserStore } = await import('@/src/store/localUserStore');
            await useLocalUserStore.getState().clearUser();
          } catch (e) {
            console.warn('[🔐AUTH_STORE] localUserStore reset skip:', e);
          }
          try {
            const { useBankSelectionStore } = await import('@/src/store/bankSelectionStore');
            useBankSelectionStore.getState().setSelectedBanks([]);
          } catch (e) {
            console.warn('[🔐AUTH_STORE] bankSelectionStore reset skip:', e);
          }
          try {
            const { useSignupStore } = await import('@/src/store/signupStore');
            useSignupStore.getState().reset?.();
          } catch (e) {
            console.warn('[🔐AUTH_STORE] signupStore reset skip:', e);
          }
          try {
            const { useSlotStore } = await import('@/src/store/useSlotStore');
            (useSlotStore.getState() as any).reset?.();
          } catch (e) {
            console.warn('[🔐AUTH_STORE] slotStore reset skip:', e);
          }
          
          // 푸시 서비스 정리 제거! (authService.clearAll()에서 처리됨)
          
          set({ 
            user: null, 
            isLoggedIn: false, 
            isLoading: false 
          });
          
          console.log('[🔐AUTH_STORE] ✅로그아웃 완료');
        } catch (error) {
          console.error('[🔐AUTH_STORE] ❌로그아웃 실패:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // 인증 상태 확인 (앱 시작 시)
      checkAuthStatus: async () => {
        try {
          set({ isLoading: true });
          
          const isLoggedIn = await authService.isLoggedIn();
          const user = isLoggedIn ? await authService.getUser() : null;
          
          set({ 
            user, 
            isLoggedIn, 
            isLoading: false 
          });
          

          
          console.log('[🔐AUTH_STORE] ✅인증 상태 확인 완료:', isLoggedIn);
        } catch (error) {
          console.error('[🔐AUTH_STORE] ❌인증 상태 확인 실패:', error);
          set({ 
            user: null, 
            isLoggedIn: false, 
            isLoading: false 
          });
        }
      },

      // 로딩 상태 설정
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // AccessToken 재발급
      refreshAccessToken: async () => {
        try {
          const newAccessToken = await authService.refreshAccessToken();
          console.log('[🔐AUTH_STORE] ✅토큰 재발급 완료');
          return newAccessToken;
        } catch (error) {
          console.error('[🔐AUTH_STORE] ❌토큰 재발급 실패:', error);
          // 토큰 재발급 실패 시 로그아웃
          await get().logout();
          return null;
        }
      },
    }),
    {
      name: 'auth-storage', // AsyncStorage 키
      partialize: (state) => ({ 
        // persist할 상태만 선택 (함수는 제외)
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
