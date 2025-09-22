/*
 * 계좌 API Mock 핸들러
 * 
 * MSW를 사용하여 계좌 관련 API를 모킹합니다.
 * 실제 서버 API와 동일한 구조로 응답을 제공합니다.
 */

import { http, HttpResponse } from 'msw';
import type { UserAccount, BaseResponse, AccountsResponse } from '@/src/types';
import { format } from '@/src/utils';
import { setActualAccountBalance } from './slots';

// MSW용 Mock 계좌 데이터 (API 응답 형태)
// 각 계좌의 잔액 = 슬롯 잔액 합계 + 미분류 금액
const mockAccounts: UserAccount[] = [
  {
    accountId: '1',
    bankCode: '004',
    bankName: '국민은행',
    accountAlias: '급여계좌',
    accountNo: '123456789012', // 원본 계좌번호 (숫자만)
    accountFormat: [3, 6, 3], // 3자리-6자리-3자리
    balance: 1500000, // 슬롯 합계(1,055,000) + 미분류(445,000)
  },
  {
    accountId: '2',
    bankCode: '088',
    bankName: '신한은행',
    accountAlias: '적금계좌',
    accountNo: '567890123456', // 원본 계좌번호 (숫자만)
    accountFormat: [6, 2, 6], // 6자리-2자리-6자리
    balance: 1000000, // 슬롯 합계(420,000) + 미분류(580,000)
  },
  {
    accountId: '3',
    bankCode: '020',
    bankName: '우리은행',
    accountAlias: '주거래계좌',
    accountNo: '901234567890', // 원본 계좌번호 (숫자만)
    accountFormat: [4, 2, 6], // 4자리-2자리-6자리
    balance: 800000, // 슬롯 합계(165,000) + 미분류(635,000)
  },
  {
    accountId: '4',
    bankCode: '081',
    bankName: '하나은행',
    accountAlias: '투자계좌',
    accountNo: '345678901234', // 원본 계좌번호 (숫자만)
    accountFormat: [3, 6, 2], // 3자리-6자리-2자리
    balance: 1200000, // 슬롯 합계(300,000) + 미분류(900,000)
  },
  {
    accountId: '5',
    bankCode: '003',
    bankName: '기업은행',
    accountAlias: '비상금계좌',
    accountNo: '789012345678', // 원본 계좌번호 (숫자만)
    accountFormat: [6, 2, 6], // 6자리-2자리-6자리
    balance: 600000, // 슬롯 합계(180,000) + 미분류(420,000)
  },
];

export const accountHandlers = [
  // 연동된 계좌 목록 조회 (GET /api/accounts/link)
  http.get('/api/accounts/link', ({ request }) => {
    // 계좌번호를 포맷팅해서 응답
    const formattedAccounts = mockAccounts.map(account => ({
      ...account,
      accountNo: format.accountNumberWithFormat(account.accountNo, account.accountFormat),
    }));
    
    const response: BaseResponse<AccountsResponse> = {
      success: true,
      message: '연동 계좌 목록 조회 성공',
      data: {
        accounts: formattedAccounts,
      },
    };
    
    return HttpResponse.json(response);
  }),

  // 특정 계좌 상세 정보 조회 (GET /api/accounts/:id)
  http.get('/api/accounts/:id', ({ params }) => {
    const { id } = params;
    const account = mockAccounts.find(acc => acc.accountId === id);
    
    if (!account) {
      const errorResponse: BaseResponse<null> = {
        success: false,
        message: '계좌를 찾을 수 없습니다.',
        data: null,
        errorCode: 'ACCOUNT_NOT_FOUND',
      };
      
      return HttpResponse.json(errorResponse, { status: 404 });
    }

    // 계좌번호를 포맷팅해서 응답
    const formattedAccount = {
      ...account,
      accountNo: format.accountNumberWithFormat(account.accountNo, account.accountFormat),
    };

    const response: BaseResponse<UserAccount> = {
      success: true,
      message: '계좌 상세 정보 조회 성공',
      data: formattedAccount,
    };

    return HttpResponse.json(response);
  }),

  // 계좌 잔액 조회 (GET /api/accounts/:id/balance)
  http.get('/api/accounts/:id/balance', ({ params }) => {
    const { id } = params;
    const account = mockAccounts.find(acc => acc.accountId === id);
    
    if (!account) {
      const errorResponse: BaseResponse<null> = {
        success: false,
        message: '계좌를 찾을 수 없습니다.',
        data: null,
        errorCode: 'ACCOUNT_NOT_FOUND',
      };
      
      return HttpResponse.json(errorResponse, { status: 404 });
    }

    // 잔액에 약간의 랜덤 변동 추가 (실제 데이터처럼)
    const baseBalance = account.balance;
    const variation = Math.floor(Math.random() * 10000) - 5000; // ±5000원 변동
    const currentBalance = Math.max(0, baseBalance + variation);
    
    // 슬롯 API에서 사용할 수 있도록 실제 잔액 저장
    setActualAccountBalance(String(id), currentBalance);

    const response: BaseResponse<{
      accountId: string;
      balance: number;
      currency: string;
      lastUpdated: string;
      availableBalance: number;
      pendingBalance: number;
    }> = {
      success: true,
      message: '계좌 잔액 조회 성공',
      data: {
        accountId: account.accountId,
        balance: currentBalance,
        currency: 'KRW',
        lastUpdated: new Date().toISOString(),
        availableBalance: currentBalance,
        pendingBalance: 0,
      },
    };

    return HttpResponse.json(response);
  }),

 
];