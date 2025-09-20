import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appService } from '@/src/services/appService';

interface AppState {
  // 상태
  onboardingDone: boolean | null;
  
  // 액션들
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  getOnboardingCompleted: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      onboardingDone: null,

      // 온보딩 완료 설정
      setOnboardingCompleted: async (completed: boolean) => {
        try {
          await appService.setOnboardingCompleted(completed);
          set({ onboardingDone: completed });
          console.log('[📱APP_STORE] ✅온보딩 완료 상태 저장:', completed);
        } catch (error) {
          console.error('[📱APP_STORE] ❌온보딩 완료 상태 저장 실패:', error);
          throw error;
        }
      },

      // 온보딩 완료 상태 조회
      getOnboardingCompleted: async () => {
        try {
          const completed = await appService.getOnboardingCompleted();
          set({ onboardingDone: completed });
          console.log('[📱APP_STORE] ✅온보딩 완료 상태 조회:', completed);
        } catch (error) {
          console.error('[📱APP_STORE] ❌온보딩 완료 상태 조회 실패:', error);
        }
      },

      // 온보딩 상태 초기화
      resetOnboarding: async () => {
        try {
          await appService.resetOnboarding();
          set({ onboardingDone: false });
          console.log('[📱APP_STORE] ✅온보딩 상태 초기화 완료');
        } catch (error) {
          console.error('[📱APP_STORE] ❌온보딩 상태 초기화 실패:', error);
          throw error;
        }
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        onboardingDone: state.onboardingDone,
      }),
    }
  )
);
