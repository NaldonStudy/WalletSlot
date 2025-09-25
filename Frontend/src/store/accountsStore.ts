import type { UserAccount } from '@/src/types';
import { create } from 'zustand';

type AccountsState = {
  accounts: UserAccount[];
  lastSyncedAt?: string;
};

type AccountsActions = {
  setAccounts: (list: UserAccount[]) => void;
  clear: () => void;
};

type AccountsStore = AccountsState & AccountsActions;

export const useAccountsStore = create<AccountsStore>((set) => ({
  accounts: [],
  lastSyncedAt: undefined,
  setAccounts: (list) => set({ accounts: list, lastSyncedAt: new Date().toISOString() }),
  clear: () => set({ accounts: [], lastSyncedAt: undefined }),
}));
