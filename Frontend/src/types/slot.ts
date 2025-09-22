import { ImageSourcePropType } from 'react-native';


// 슬롯 기본 정보
export interface SlotData {
  slotId: string;
  slotName: string;
  slotIcon: ImageSourcePropType;  
  slotColor: string;
  budget: number;
  remaining: number;
}

export interface SlotsResponse {
  slots: SlotData[];
}

// 하루 단위 합계 지출 내역
export interface SlotDailySpending {
  date: string;   // YYYY-MM-DD
  spent: number;  // 해당 날짜의 지출 합계
}

export interface SlotDailySpendingResponse {
  startDate: string;
  transactions: SlotDailySpending[];
}

// 개별 거래내역
export interface SlotTransaction {
  transactionId: string;
  date: string;       // YYYY-MM-DD
  amount: number;     // 금액 (+/-)
  remaining: number; // 잔액
  summary: string // 거래처
  category?: string;   // 선택적으로 카테고리
}

export interface SlotTransactionsResponse {
  transactions: SlotTransaction[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
}



