import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccountSelectionState {
  // 현재 선택된 계좌 정보
  selectedAccountId: string | null;
  selectedAccountSlotId: string | null;
  
  // 액션들
  setSelectedAccount: (accountId: string, accountSlotId: string) => void;
  clearSelection: () => void;
  
  // 헬퍼 함수들
  getCurrentAccountId: () => string | null;
  getCurrentAccountSlotId: () => string | null;
  hasSelection: () => boolean;
}

export const useAccountSelectionStore = create<AccountSelectionState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      selectedAccountId: null,
      selectedAccountSlotId: null,
      
      // 계좌 선택
      setSelectedAccount: (accountId: string, accountSlotId: string) => {
        set({
          selectedAccountId: accountId,
          selectedAccountSlotId: accountSlotId,
        });
      },
      
      // 선택 초기화
      clearSelection: () => {
        set({
          selectedAccountId: null,
          selectedAccountSlotId: null,
        });
      },
      
      // 헬퍼 함수들
      getCurrentAccountId: () => {
        return get().selectedAccountId;
      },
      
      getCurrentAccountSlotId: () => {
        return get().selectedAccountSlotId;
      },
      
      hasSelection: () => {
        const state = get();
        return !!(state.selectedAccountId && state.selectedAccountSlotId);
      },
    }),
    {
      name: 'account-selection-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 민감한 정보가 아니므로 전체 상태를 저장
    }
  )
);
