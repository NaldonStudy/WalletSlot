import { useLinkedAccounts } from './useLinkedAccounts';
import { useAccountBalance } from './useAccountBalance';

export const useAccounts = (accountId?: string) => {
  const linked = useLinkedAccounts({ enabled: !accountId }); // accountId가 없으면 네트워크 요청
  const balance = useAccountBalance(accountId);

  return {
    linked,
    balance,
  };
};
