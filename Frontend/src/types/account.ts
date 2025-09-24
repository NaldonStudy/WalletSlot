export interface UserAccount {
    accountId: string;
    bankCode: string;
    bankName: string;
    accountNo: string;
    alias: string;
    accountBalance: number;
}

export interface AccountsResponse {
    accounts: UserAccount[];
}
