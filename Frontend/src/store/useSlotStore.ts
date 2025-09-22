import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SlotData } from '@/src/types';

type SelectedSlot = SlotData & { accountId: string };

type SlotStore = {
  selectedSlot: SelectedSlot | null;
  setSelectedSlot: (slot: SelectedSlot | null) => void;
};


export const useSlotStore = create<SlotStore>()(
    persist(
      (set) => ({
        selectedSlot: null,
        setSelectedSlot: (slot) => set({ selectedSlot: slot }),
      }),
      {
        name: 'slot-storage', // localStorage/AsyncStorage key
      }
    )
  );
  