import { useAccountBalance } from './useAccountBalance';
import { useLinkedAccounts } from './useLinkedAccounts';

export const useAccounts = (accountId?: string) => {
  const linked = useLinkedAccounts({ enabled: false }); // API 호출 비활성화
  const balance = useAccountBalance(accountId);

  return {
    linked,
    balance,
  };
};
