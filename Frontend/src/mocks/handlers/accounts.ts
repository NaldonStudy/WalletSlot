/*
 * 계좌 API Mock 핸들러
 * 
 * MSW를 사용하여 계좌 관련 API를 모킹합니다.
 * 실제 서버 API와 동일한 구조로 응답을 제공합니다.
 */

import type { AccountsResponse, BaseResponse, UserAccount } from '@/src/types';
import { format } from '@/src/utils';
import { http, HttpResponse } from 'msw';
import { setActualAccountBalance } from './slots';

// MSW용 Mock 계좌 데이터 (API 응답 형태)
// 각 계좌의 잔액 = 슬롯 잔액 합계 + 미분류 금액
const mockAccounts: UserAccount[] = [
  {
    accountId: '1',
    bankCode: '004',
    bankName: 'KB국민은행',
    accountAlias: '내 주계좌',
    accountNo: '123456789012', // 원본 계좌번호 (숫자만)
    accountFormat: [3, 6, 3], // 3자리-6자리-3자리
    balance: 1500000, // 슬롯 합계(1,055,000) + 미분류(445,000)
  },
  {
    accountId: '2',
    bankCode: '088',
    bankName: '신한은행',
    accountAlias: '적금통장',
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
  {
    accountId: '6',
    bankCode: '011',
    bankName: 'NH농협은행',
    accountAlias: '생활비통장',
    accountNo: '234567890123', // 원본 계좌번호 (숫자만)
    accountFormat: [3, 2, 6, 1], // 3자리-2자리-6자리-1자리
    balance: 320000, // 슬롯 합계(80,000) + 미분류(240,000)
  },
];

export const accountHandlers = [
  // 연동된 계좌 목록 조회 (GET /api/accounts/link)
  http.get('*/api/accounts/link', ({ request }) => {
    
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
  http.get('*/api/accounts/:id', ({ params }) => {
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

  // 계좌 연동 해제 (DELETE /api/accounts/:id)
  http.delete('*/api/accounts/:id', ({ params }) => {
    const { id } = params;
    const accountIndex = mockAccounts.findIndex(acc => acc.accountId === id);
    
    if (accountIndex === -1) {
      const errorResponse: BaseResponse<null> = {
        success: false,
        message: '계좌를 찾을 수 없습니다.',
        data: null,
        errorCode: 'ACCOUNT_NOT_FOUND',
      };
      
      return HttpResponse.json(errorResponse, { status: 404 });
    }
    
    const deletedAccount = mockAccounts.splice(accountIndex, 1)[0];
    
    const response: BaseResponse<{ accountId: string; bankName: string; accountAlias: string }> = {
      success: true,
      message: '계좌 연동이 해제되었습니다.',
      data: {
        accountId: deletedAccount.accountId,
        bankName: deletedAccount.bankName,
        accountAlias: deletedAccount.accountAlias,
      },
    };
    
    return HttpResponse.json(response);
  }),

  // 마이데이터 재연동 (GET /api/accounts)
  http.get('*/api/accounts', ({ request }) => {
    console.log('[MOCK] 마이데이터 재연동 요청');
    
    // 새로운 계좌 추가하는 시뮬레이션 (재연동 효과)
    const newAccount: UserAccount = {
      accountId: `new-account-${Date.now()}`,
      bankCode: '027',
      bankName: '씨티은행',
      accountAlias: '새로 연동된 계좌',
      accountNo: '567890123456',
      accountFormat: [3, 2, 6, 1],
      balance: 750000,
    };

    // 실제로 mockAccounts 배열에 추가 (이미 존재하지 않는 경우에만)
    const existingAccount = mockAccounts.find(acc => acc.bankCode === '027');
    if (!existingAccount) {
      mockAccounts.push(newAccount);
      console.log('[MOCK] 새 계좌 추가:', newAccount.accountAlias, '총 계좌 수:', mockAccounts.length);
    }

    // 현재 mockAccounts 배열 상태로 응답
    const allAccounts = [...mockAccounts];
    
    const formattedAccounts = allAccounts.map(account => ({
      ...account,
      accountNo: format.accountNumberWithFormat(account.accountNo, account.accountFormat),
    }));
    
    const response: BaseResponse<AccountsResponse> = {
      success: true,
      message: '마이데이터 재연동 성공',
      data: {
        accounts: formattedAccounts,
      },
    };
    
    return HttpResponse.json(response);
  }),
];