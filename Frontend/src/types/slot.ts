import { ImageSourcePropType } from 'react-native';


// 슬롯 기본 정보
export interface SlotData {
  slotId: string;
  name: string;
  // 레거시 코드에서 사용하는 이름(slotName)과의 호환성
  slotName?: string;
  // 슬롯 아이콘(이미지 소스) 사용처가 있어 옵셔널로 정의
  slotIcon?: ImageSourcePropType | { uri: string } | string;
  slotColor?: string;
  // 레거시/정규화 코드에서 사용되는 추가 필드들
  budget?: number;
  remaining?: number;
  accountSlotId: string;
  customName: string;  // 사용자가 설정한 이름 -> null 이면 name 사용용
  initialBudget: number; // 초기 예산
  currentBudget: number; // 변경한 예산
  spent: number; // 지출 합계
  remainingBudget: number; // 잔액
  exceededBudget: number; // 초과 금액
  budgetChangeCount: number; // 예산 변경 횟수
  isSaving: boolean; // 저축슬롯 여부
  isCustom: boolean;
  isBudgetExceeded: boolean; // 예산 초과 여부부
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
  type: string;
  opponentAccountNo: string // 이체일때 상대방 계좌번호
  transactionAt: string;       // YYYY-MM-DD (DateTime)
  amount: number;     // 금액 (+/-)
  balance: number; // 잔액
  summary: string // 거래처
}

export interface SlotTransactionsResponse {
  transactions: SlotTransaction[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  pageSize: number;
}



