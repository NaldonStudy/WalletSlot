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
const mockAccounts: UserAccount[] = [
  {
    accountId: '1',
    bankCode: '004',
    bankName: '국민은행',
    accountNo: '123-456789-012',
    alias: '급여계좌',
    accountBalance: '1500000',
  },
  {
    accountId: '2',
    bankCode: '088',
    bankName: '신한은행',
    accountNo: '567890-12-3456',
    alias: '적금계좌',
    accountBalance: '1000000',
  },
  {
    accountId: '3',
    bankCode: '020',
    bankName: '우리은행',
    accountNo: '9012-34-567890',
    alias: '주거래계좌',
    accountBalance: '800000',
  },
  {
    accountId: '4',
    bankCode: '081',
    bankName: '하나은행',
    accountNo: '345-678901-23',
    alias: '투자계좌',
    accountBalance: '1200000',
  },
  {
    accountId: '5',
    bankCode: '003',
    bankName: '기업은행',
    accountNo: '789012-34-5678',
    alias: '비상금계좌',
    accountBalance: '600000',
  },
];

export const accountHandlers = [
  // 연동된 계좌 목록 조회 (GET /api/accounts/link) - 실제 API 사용을 위해 완전히 제거됨

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

    const response: BaseResponse<UserAccount> = {
      success: true,
      message: '계좌 상세 정보 조회 성공',
      data: account,
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
    const baseBalance = parseInt(account.accountBalance);
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