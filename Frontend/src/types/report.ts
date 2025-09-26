/**
 * 소비 레포트 관련 타입 정의
 */

// 기간 정보
export interface ReportPeriod {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  baseDay: number;   // 기준일 (1-31)
}

// 예산 vs 실제 지출 비교
export interface BudgetComparison {
  totalBudget: number;      // 총 예산 (원)
  totalSpent: number;       // 총 지출 (원)
  changePercent: number;    // 전월 대비 증감률 (%)
  transactionCount: number; // 거래 횟수
}

// 카테고리별 지출 분석
export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  slotName: string;
  budgetAmount: number;     // 예산 (원)
  spentAmount: number;      // 지출 (원)
  changePercent: number;    // 전월 대비 증감률 (%)
  spendingRatio: number;    // 예산 대비 지출 비율 (0.0 ~ 1.0+)
  status: 'under' | 'optimal' | 'over'; // 지출 상태 (under: 부족, optimal: 적정(90-100%), over: 초과)
}

// 또래 비교 데이터
export interface PeerComparison {
  demographicInfo: {
    ageGroup: string;    // "20대", "30대" 등
    gender: 'M' | 'F' | 'O';
    incomeRange: string; // "200-300만원" 등
  };
  categories: {
    categoryName: string;
    mySpending: number;      // 내 지출 (원)
    peerAverage: number;     // 또래 평균 (원)
    comparisonPercent: number; // 또래 대비 비율 (%) - 100% 기준
  }[];
}

// 상위 지출 카테고리 (Top 3)
export interface TopSpendingCategory {
  categoryName: string;
  slotName: string;
  amount: number;       // 지출 금액 (원)
  percentage: number;   // 전체 지출 대비 비율 (%)
}

// 다음 달 예산 제안
export interface BudgetSuggestion {
  totalSuggested: number; // 제안 총 예산 (원)
  categories: {
    categoryName: string;
    currentBudget: number;     // 현재 예산 (원)
    suggestedBudget: number;   // 제안 예산 (원)
    reason: string;            // 제안 이유
  }[];
}

// 개인화 인사이트 (GPT 분석 결과)
export interface PersonalizedInsight {
  spendingType: string;      // "외식형", "쇼핑형" 등
  spendingTypeDescription: string; // 소비 유형 설명
  suggestions: {
    title: string;
    description: string;
    actionItems: string[];   // 실행 가능한 액션 아이템들
  }[];
  strengths: string[];       // 잘하고 있는 부분들
  improvements: string[];    // 개선이 필요한 부분들
}

// 전체 소비 레포트 API 응답
export interface SpendingReport {
  period: ReportPeriod;
  budgetComparison: BudgetComparison;
  categoryAnalysis: CategorySpending[];
  peerComparison: PeerComparison;
  topSpendingCategories: TopSpendingCategory[];
  budgetSuggestion: BudgetSuggestion;
  personalizedInsight: PersonalizedInsight;
}

// API 응답 래퍼
export interface SpendingReportResponse {
  success: boolean;
  data: SpendingReport;
  message?: string;
}