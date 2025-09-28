import { useAccountBalance } from './useAccountBalance';
import { useLinkedAccounts } from './useLinkedAccounts';

export const useAccounts = (accountId?: string) => {
  const linked = useLinkedAccounts({ enabled: true }); // API 호출 활성화
  const balance = useAccountBalance(accountId);

  return {
    linked,
    balance,
  };
};
