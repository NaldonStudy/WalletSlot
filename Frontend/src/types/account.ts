export interface UserAccount {
    accountId: string;
    bankId: string; // UUID
    bankName: string;
    accountNo: string;
    // API 명세에 따라 단일 필드로 통일: `alias`와 숫자 `balance`
    alias: string;
    balance: number;
    // 계좌번호 포맷(예: [3,6,3])을 사용하는 경우가 있어 옵셔널로 둡니다.
    accountFormat?: number[];
}

export interface AccountsResponse {
    accounts: UserAccount[];
}
