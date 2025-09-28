export interface UserAccount {
    accountId: string;
    bankId: string;
    bankName: string;
    accountNo: string;
    alias: string;
    accountBalance: string;
}

export interface AccountsRequest {
    selectBanks: {
        bankId: string;
    }[];
}

export interface AccountsResponse {
    accounts: UserAccount[];
}


export interface AccountBalanceResponse {
  success: boolean;
  message: string;
  data: {
    accountId: string;
    balance: number;
  };
}

export interface AccountLinkRequest {
  accounts: {
    bankId: string;
    accountNo: string;
  }[];
}

export interface AccountLinkResponse {
  success: boolean;
  message: string;
  data: {
    accounts: {
      accountId: string;
      bankId: string;
      bankName: string;
      accountNo: string;
      alias: string;
      accountBalance: string;
    }[];
  };
}

export interface AccountUpdateRequest {
  alias?: string;
  isPrimary?: boolean;
}

export interface AccountUpdateResponse {
  success: boolean;
  message: string;
  data: {
    accountId: string;
    bankId: string;
    bankName: string;
    accountNo: string;
    alias: string;
    accountBalance: string;
  };
}

export interface SlotRecommendationRequest {
  startDate: string;
  endDate: string;
}

export interface SlotRecommendationByProfileRequest {
  useAge: boolean;
  income: number;
  useGender: boolean;
}

export interface RecommendedSlot {
  slotId: string;
  name: string;
  initialBudget: number;
}

export interface SlotRecommendationResponse {
  success: boolean;
  message?: string;
  data: {
    bank: {
      bankId: string;
      name: string;
      color: string;
    };
    account: {
      accountId: string;
      accountNo: string;
      accountBalance: number;
    };
    recommededSlots: RecommendedSlot[];
  };
}

