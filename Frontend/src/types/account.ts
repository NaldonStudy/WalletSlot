export interface UserAccount {
    bankCode: string;
    bankName: string;
    accountId: string;
    accountNo: string;
    accountFormat: number[];
    balance: number;
}

export interface AccountsResponse {
    accounts: UserAccount[];
}
  