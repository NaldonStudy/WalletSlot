export interface UserAccount {
    accountId: string;
    bankId: string;
    bankName: string;
    accountNo: string;
    alias: string;
    accountBalance: string;
}


export interface AccountsResponse {
    accounts: UserAccount[];
}
