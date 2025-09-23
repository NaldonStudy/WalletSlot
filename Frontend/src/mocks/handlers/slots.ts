/*
 * 슬롯 API Mock 핸들러
 * 
 * MSW를 사용하여 슬롯 관련 API를 모킹합니다.
 * 실제 서버 API와 동일한 구조로 응답을 제공합니다.
 */

import { http, HttpResponse } from 'msw';
import type { SlotData, BaseResponse, SlotsResponse, SlotDailySpendingResponse } from '@/src/types';
import { SLOT_CATEGORIES } from '@/src/constants/slots';

// MSW용 Mock 슬롯 데이터 (API 응답 형태)
const mockSlots: SlotData[] = [
  {
    slotId: "01", // 식비
    slotName: "식비",
    slotIcon: require('../../assets/icons/slots/식비.png'),
    slotColor: "#F1A791",
    budget: 400000,
    remaining: -20000,
    isSaving: false,
  },
  {
    slotId: "18", // 데이트
    slotName: "한별이랑 데이트 비용",
    slotIcon: require('../../assets/icons/slots/데이트비용.png'),
    slotColor: "#F26C61",
    budget: 500000,
    remaining: 230000,
    isSaving: false,
  },
  {
    slotId: "02", // 교통비
    slotName: "교통비",
    slotIcon: require('../../assets/icons/slots/교통.png'),
    slotColor: "#F5D690",
    budget: 150000,
    remaining: 45000,
    isSaving: false,
  },
  {
    slotId: "05", // 여가비
    slotName: "문화생활비",
    slotIcon: require('../../assets/icons/slots/문화생활비.png'),
    slotColor: "#8ECF82",
    budget: 200000,
    remaining: 120000,
    isSaving: false,
  },
  {
    slotId: "07", // 저축
    slotName: "저축",
    slotIcon: require('../../assets/icons/slots/저축.png'),
    slotColor: "#3C8182",
    budget: 1000000,
    remaining: 800000,
    isSaving: true, // 저축 슬롯
  },
  {
    slotId: "12", // 통신비
    slotName: "통신비",
    slotIcon: require('../../assets/icons/slots/통신비.png'),
    slotColor: "#AEDAD7",
    budget: 80000,
    remaining: 0,
    isSaving: false,
  },
  {
    slotId: "11", // 보험비
    slotName: "보험비",
    slotIcon: require('../../assets/icons/slots/보험비.png'),
    slotColor: "#88CDD5",
    budget: 300000,
    remaining: 300000,
    isSaving: false,
  },
  {
    slotId: "13", // 주거비
    slotName: "주거비",
    slotIcon: require('../../assets/icons/slots/주거비.png'),
    slotColor: "#5E9DDE",
    budget: 800000,
    remaining: 0,
    isSaving: false,
  },
  {
    slotId: "08", // 미용
    slotName: "미용",
    slotIcon: require('../../assets/icons/slots/미용.png'),
    slotColor: "#E8A87C",
    budget: 100000,
    remaining: 30000,
    isSaving: false,
  },
  {
    slotId: "15", // 취미
    slotName: "취미",
    slotIcon: require('../../assets/icons/slots/취미.png'),
    slotColor: "#A8E6CF",
    budget: 300000,
    remaining: 150000,
    isSaving: false,
  },
  {
    slotId: "25", // 미분류 슬롯
    slotName: "미분류",
    slotIcon: { uri: "" }, // 아이콘 없음
    slotColor: "", // 색상 없음
    budget: 0, // 예산 없음
    remaining: 0, // 잔액은 동적으로 계산
    isSaving: false,
  },
];

// 계좌별 잔액 데이터 (슬롯 잔액 합계 + 미분류 금액)
// 실제 슬롯 데이터를 기반으로 재계산:
// 계좌 1: 식비(-20,000) + 데이트(230,000) + 교통비(45,000) + 저축(800,000) = 1,055,000 + 미분류(445,000) = 1,500,000
// 계좌 2: 문화생활비(120,000) + 통신비(0) + 보험비(300,000) + 주거비(0) = 420,000 + 미분류(580,000) = 1,000,000
// 계좌 3: 식비(-20,000) + 교통비(45,000) + 문화생활비(120,000) = 145,000 + 미분류(655,000) = 800,000
// 계좌 4: 저축(800,000) + 보험비(300,000) + 주거비(0) = 1,100,000 + 미분류(100,000) = 1,200,000
// 계좌 5: 통신비(0) + 미용(30,000) + 취미(150,000) = 180,000 + 미분류(420,000) = 600,000
const accountBalances: Record<string, number> = {
  '1': 1500000, // 슬롯 합계(1,055,000) + 미분류(445,000)
  '2': 1000000, // 슬롯 합계(420,000) + 미분류(580,000)
  '3': 800000,  // 슬롯 합계(145,000) + 미분류(655,000)
  '4': 1200000, // 슬롯 합계(1,100,000) + 미분류(100,000)
  '5': 600000,  // 슬롯 합계(180,000) + 미분류(420,000)
};

// 계좌별 실제 잔액 저장 (계좌 잔액 API에서 설정됨)
const actualAccountBalances: Record<string, number> = {};

// 계좌 잔액 API에서 설정한 실제 잔액을 저장하는 함수
export const setActualAccountBalance = (accountId: string, balance: number) => {
  actualAccountBalances[accountId] = balance;
  console.log(`[MSW] Set actual balance for account ${accountId}: ${balance.toLocaleString()}원`);
};

// 계좌별 슬롯 잔액 합계 계산 함수 (미분류 슬롯 제외)
const calculateSlotBalance = (accountId: string): number => {
  let accountSlots: SlotData[] = [];

  if (accountId === '1') {
    accountSlots = mockSlots.filter(slot => ['01', '18', '02', '07'].includes(slot.slotId));
  } else if (accountId === '2') {
    accountSlots = mockSlots.filter(slot => ['05', '12', '11', '13'].includes(slot.slotId));
  } else if (accountId === '3') {
    accountSlots = mockSlots.filter(slot => ['01', '02', '05'].includes(slot.slotId));
  } else if (accountId === '4') {
    accountSlots = mockSlots.filter(slot => ['07', '11', '13'].includes(slot.slotId));
  } else if (accountId === '5') {
    accountSlots = mockSlots.filter(slot => ['12', '08', '15'].includes(slot.slotId));
  } else {
    accountSlots = mockSlots;
  }

  // 미분류 슬롯(slotId "25") 제외하고 계산
  const regularSlots = accountSlots.filter(slot => slot.slotId !== "25");
  const balance = regularSlots.reduce((sum, slot) => sum + slot.remaining, 0);

  return balance;
};

// Mock 데이터 정의
const mockDailySpending: Record<string, SlotDailySpendingResponse> = {
  // 🍚 식비 (slotId: 01) - budget: 400000, remaining: -20000, spent 합: 420000
  '1-01': {
    startDate: '2025-09-01',
    transactions: [
      { date: '2025-09-01', spent: 15000 },
      { date: '2025-09-02', spent: 12000 },
      { date: '2025-09-03', spent: 18000 },
      { date: '2025-09-04', spent: 22000 },
      { date: '2025-09-05', spent: 16000 },
      { date: '2025-09-06', spent: 25000 },
      { date: '2025-09-07', spent: 14000 },
      { date: '2025-09-08', spent: 19000 },
      { date: '2025-09-09', spent: 21000 },
      { date: '2025-09-10', spent: 17000 },
      { date: '2025-09-11', spent: 23000 },
      { date: '2025-09-12', spent: 18000 },
      { date: '2025-09-13', spent: 26000 },
      { date: '2025-09-14', spent: 15000 },
      { date: '2025-09-15', spent: 20000 },
      { date: '2025-09-16', spent: 24000 },
      { date: '2025-09-17', spent: 16000 },
      { date: '2025-09-18', spent: 22000 },
      { date: '2025-09-19', spent: 19000 },
      { date: '2025-09-20', spent: 25000 },
      { date: '2025-09-21', spent: 18000 },
      { date: '2025-09-22', spent: 21000 },
      { date: '2025-09-23', spent: 17000 },
      { date: '2025-09-24', spent: 23000 },
      { date: '2025-09-25', spent: 16000 },
      { date: '2025-09-26', spent: 20000 },
      { date: '2025-09-27', spent: 24000 },
      { date: '2025-09-28', spent: 15000 },
      { date: '2025-09-29', spent: 19000 },
      { date: '2025-09-30', spent: 22000 },
    ],
  },

  // ❤️ 데이트 비용 (slotId: 18) - budget: 500000, remaining: 230000, spent 합: 270000
  '1-18': {
    startDate: '2025-09-01',
    transactions: [
      { date: '2025-09-02', spent: 45000 },
      { date: '2025-09-05', spent: 38000 },
      { date: '2025-09-08', spent: 52000 },
      { date: '2025-09-12', spent: 41000 },
      { date: '2025-09-15', spent: 48000 },
      { date: '2025-09-18', spent: 35000 },
      { date: '2025-09-22', spent: 56000 },
      { date: '2025-09-25', spent: 42000 },
      { date: '2025-09-28', spent: 39000 },
    ],
  },

  // 🚍 교통비 (slotId: 02) - budget: 150000, remaining: 45000, spent 합: 105000
  '1-02': {
    startDate: '2025-09-01',
    transactions: [
      { date: '2025-09-01', spent: 3500 },
      { date: '2025-09-02', spent: 3500 },
      { date: '2025-09-03', spent: 3500 },
      { date: '2025-09-04', spent: 3500 },
      { date: '2025-09-05', spent: 3500 },
      { date: '2025-09-06', spent: 3500 },
      { date: '2025-09-07', spent: 3500 },
      { date: '2025-09-08', spent: 3500 },
      { date: '2025-09-09', spent: 3500 },
      { date: '2025-09-10', spent: 3500 },
      { date: '2025-09-11', spent: 3500 },
      { date: '2025-09-12', spent: 3500 },
      { date: '2025-09-13', spent: 3500 },
      { date: '2025-09-14', spent: 3500 },
      { date: '2025-09-15', spent: 3500 },
      { date: '2025-09-16', spent: 3500 },
      { date: '2025-09-17', spent: 3500 },
      { date: '2025-09-18', spent: 3500 },
      { date: '2025-09-19', spent: 3500 },
      { date: '2025-09-20', spent: 3500 },
      { date: '2025-09-21', spent: 3500 },
      { date: '2025-09-22', spent: 3500 },
      { date: '2025-09-23', spent: 3500 },
      { date: '2025-09-24', spent: 3500 },
      { date: '2025-09-25', spent: 3500 },
      { date: '2025-09-26', spent: 3500 },
      { date: '2025-09-27', spent: 3500 },
      { date: '2025-09-28', spent: 3500 },
      { date: '2025-09-29', spent: 3500 },
      { date: '2025-09-30', spent: 3500 },
    ],
  },

  // 💰 저축 (slotId: 07) - budget: 1000000, remaining: 800000, spent 합: 200000
  '1-07': {
    startDate: '2025-09-01',
    transactions: [
      { date: '2025-09-01', spent: 100000 },
      { date: '2025-09-15', spent: 100000 },
    ],
  },
};

export const slotHandlers = [
  // 계좌별 슬롯 목록 조회 (GET /api/accounts/{accountId}/slots)
  http.get('/api/accounts/:accountId/slots', ({ params }) => {
    const { accountId } = params;


    // 계좌별로 다른 슬롯 데이터를 반환 (실제로는 accountId에 따라 필터링)
    // accountId에 따라 다른 슬롯 조합을 반환
    let accountSlots: SlotData[] = [];

    if (accountId === '1') {
      // 첫 번째 계좌: 식비, 데이트, 교통비, 저축
      accountSlots = mockSlots.filter(slot =>
        ['01', '18', '02', '07'].includes(slot.slotId)
      );
    } else if (accountId === '2') {
      // 두 번째 계좌: 여가비, 통신비, 보험비, 주거비
      accountSlots = mockSlots.filter(slot =>
        ['05', '12', '11', '13'].includes(slot.slotId)
      );
    } else if (accountId === '3') {
      // 세 번째 계좌: 식비, 교통비, 문화생활비
      accountSlots = mockSlots.filter(slot =>
        ['01', '02', '05'].includes(slot.slotId)
      );
    } else if (accountId === '4') {
      // 네 번째 계좌: 저축, 보험비, 주거비
      accountSlots = mockSlots.filter(slot =>
        ['07', '11', '13'].includes(slot.slotId)
      );
    } else if (accountId === '5') {
      // 다섯 번째 계좌: 통신비, 미용, 취미
      accountSlots = mockSlots.filter(slot =>
        ['12', '08', '15'].includes(slot.slotId)
      );
    } else {
      // 기본: 모든 슬롯
      accountSlots = mockSlots;
    }

    // 미분류 금액 계산 - 계좌 잔액 API에서 설정한 실제 잔액 사용
    const accountIdStr = String(accountId);
    const slotBalance = calculateSlotBalance(accountIdStr);

    // 계좌 잔액 API에서 설정한 실제 잔액 사용 (없으면 기본값 사용)
    const actualBalance = actualAccountBalances[accountIdStr] || accountBalances[accountIdStr] || 0;
    const uncategorizedAmount = actualBalance - slotBalance;

    // 미분류 슬롯 추가 (모든 계좌에 포함)
    const uncategorizedSlot: SlotData = {
      slotId: "25",
      slotName: "미분류",
      slotIcon: { uri: "" },
      slotColor: "",
      budget: 0,
      remaining: uncategorizedAmount,
      isSaving: false,
    };

    // 일반 슬롯과 미분류 슬롯을 합침
    accountSlots = [...accountSlots, uncategorizedSlot];

    const response: BaseResponse<SlotsResponse> = {
      success: true,
      message: '[SlotService - 000] 슬롯 리스트 조회 성공',
      data: {
        slots: accountSlots,
      },
    };

    return HttpResponse.json(response);
  }),

  // 계좌별 슬롯 하루 지출 합계 조회 (GET /api/accounts/:accountId/slots/:slotId/daily-spending)
  http.get('/api/accounts/:accountId/slots/:slotId/daily-spending', ({ params }) => {
    const { accountId, slotId } = params;
    const key = `${accountId}-${slotId}`;
    const data = mockDailySpending[key];

    if (!data) {
      const errorResponse: BaseResponse<null> = {
        success: false,
        message: '슬롯 하루 지출 데이터를 찾을 수 없습니다.',
        data: null,
        errorCode: 'DAILY_SPENDING_NOT_FOUND',
      };
      return HttpResponse.json(errorResponse, { status: 404 });
    }

    const response: BaseResponse<SlotDailySpendingResponse> = {
      success: true,
      message: '[SlotService - 000] 슬롯 하루 지출 합계 조회 성공',
      data,
    };
    return HttpResponse.json(response);
  }),
];
