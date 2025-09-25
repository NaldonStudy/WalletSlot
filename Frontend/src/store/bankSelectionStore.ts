import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SelectedBank = {
  bankId: string; // UUID
  bankName: string;
};

export type BankSelectionState = {
  // legacy codes (kept for compatibility)
  selectedBankCodes: string[] | null;
  setSelectedBankCodes: (codes: string[] | null) => void;

  // banks chosen by user (code + name only)
  selectedBanks: SelectedBank[];
  setSelectedBanks: (list: SelectedBank[]) => void;

  clear: () => void;
};

export const useBankSelectionStore = create<BankSelectionState>()(
  persist(
    (set) => ({
      selectedBankCodes: null,
      setSelectedBankCodes: (codes) => set({ selectedBankCodes: codes }),

      selectedBanks: [],
      setSelectedBanks: (list) => set({ selectedBanks: list }),

      clear: () => set({ selectedBankCodes: null, selectedBanks: [] }),
    }),
    {
      name: 'bank-selection-temp',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        selectedBankCodes: state.selectedBankCodes,
        selectedBanks: state.selectedBanks,
      }),
    }
  )
);
