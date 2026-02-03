import { create } from 'zustand';

export type SelectedBank = {
  bankId: string; // UUID
  bankName: string;
};

export type BankSelectionState = {
  // banks chosen by user (code + name only)
  selectedBanks: SelectedBank[];
  setSelectedBanks: (list: SelectedBank[]) => void;

  clear: () => void;
};

export const useBankSelectionStore = create<BankSelectionState>()((set) => ({
  selectedBanks: [],
  setSelectedBanks: (list) => set({ selectedBanks: list }),
  clear: () => set({ selectedBanks: [] }),
}));
