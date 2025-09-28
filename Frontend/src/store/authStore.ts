import { queryClient } from '@/src/api/queryClient';
import { authService } from '@/src/services/authService';
import type { LocalUser } from '@/src/types';
import type { LoginResponse } from '@/src/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// AsyncStorage 래퍼: setItem/removeItem에 간단한 retry를 적용해 일시적 unavailability 완화
function createRetryingStorage(retries = 3, delayMs = 100) {
  return {
    getItem: async (name: string) => {
      try {
        return await AsyncStorage.getItem(name);
      } catch (e) {
        console.warn('[PERSIST_STORAGE] getItem 실패:', name, e);
        return null;
      }
    },
    setItem: async (name: string, value: string) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          return await AsyncStorage.setItem(name, value);
        } catch (e) {
          if (attempt === retries) throw e;
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    },
    removeItem: async (name: string) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          return await AsyncStorage.removeItem(name);
        } catch (e) {
          if (attempt === retries) throw e;
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
    },
  } as any;
}

interface AuthState {
  // 상태
  user: LocalUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  
  // 액션들
  login: (response: LoginResponse) => Promise<void>;
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

      // 로그인 (서버에서 파싱된 응답 객체를 받음)
      login: async (response: LoginResponse) => {
        try {
          set({ isLoading: true });

          // authService를 통해 토큰/사용자(있을 경우) 저장
          await authService.saveLoginData(response as any);

          // 저장된 사용자 정보 조회
          let user = await authService.getUser();

          // 서버 응답이 토큰만 제공해 사용자 정보가 없다면,
          // 여기는 authStore 레벨에서 한 번만 프로필 조회를 시도합니다 (보수적).
          if (!user) {
            try {
              const { profileApi } = await import('@/src/api/profile');
              const profile = await profileApi.getMe();
              if (profile) {
                const localUser = {
                  userId: (profile as any).userId ?? (profile as any).id ?? 0,
                  userName: (profile as any).name ?? '사용자',
                  isPushEnabled: (profile as any).isPushEnabled ?? true,
                } as LocalUser;
                // 저장 후 다시 읽어 상태에 반영
                await authService.saveUser(localUser);
                user = await authService.getUser();
                console.log('[🔐AUTH_STORE] 프로필 조회 및 저장 완료');
              }
            } catch (e) {
              console.warn('[🔐AUTH_STORE] 프로필 조회 실패, 건너뜁니다:', e);
            }
          }

          const isLoggedIn = await authService.isLoggedIn();

          set({ 
            user, 
            isLoggedIn, 
            isLoading: false 
          });

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
            useBankSelectionStore.getState().setSelectedBankCodes([]);
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
      storage: createJSONStorage(() => createRetryingStorage()),
      partialize: (state) => ({ 
        // persist할 상태만 선택 (함수는 제외)
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
      // 스토리지 복원 실패 시 로그만 남기고 계속 진행
      onRehydrateStorage: () => (state, err) => {
        if (err) console.warn('[AUTH_STORE] 스토리지 복원 실패, 기본값 사용:', err);
      },
    }
  )
);
