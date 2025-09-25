import { SlotData } from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SelectedSlot = SlotData & { accountId: string };

type SlotStore = {
  selectedSlot: SelectedSlot | null;
  setSelectedSlot: (slot: SelectedSlot | null) => void;
};


const baseStore: StateCreator<SlotStore> = (set) => ({
  selectedSlot: null,
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
});

const isBrowser = typeof window !== 'undefined';

const persistedStore = persist(baseStore, {
  name: 'slot-storage',
  storage: createJSONStorage(() => AsyncStorage),
  // 스토리지 접근 실패 시 무시하고 계속 진행
  onRehydrateStorage: () => (state, error) => {
    if (error) {
      console.log('[SLOT_STORE] 스토리지 복원 실패, 기본값 사용:', error);
    }
  },
});

export const useSlotStore = create<SlotStore>()(
  (isBrowser ? persistedStore : baseStore) as StateCreator<SlotStore>
);
  