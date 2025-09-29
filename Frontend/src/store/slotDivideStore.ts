import { SlotRecommendationResponse } from '@/src/types/account';
import { create } from 'zustand';

// 수입 레벨 계산 함수
const calculateIncomeLevel = (income: string): string | null => {
  // 숫자만 추출 (콤마, 만원 등 제거)
  const numericIncome = parseInt(income.replace(/[^0-9]/g, ''), 10);
  
  if (isNaN(numericIncome)) return null;
  
  // 만원 단위로 변환
  const incomeInWon = numericIncome;
  
  if (incomeInWon <= 100) return 'E';      // 1백만원 이하
  if (incomeInWon <= 200) return 'F';      // 1백만원 ~ 2백만원
  if (incomeInWon <= 300) return 'G';      // 2백만원 ~ 3백만원
  if (incomeInWon <= 400) return 'D';      // 3백만원 ~ 4백만원
  if (incomeInWon <= 500) return 'C';      // 4백만원 ~ 5백만원
  if (incomeInWon <= 1000) return 'B';     // 5백만원 ~ 1천만원
  return 'A';                              // 1천만원 이상
};

interface SlotDivideData {
  baseDay: string;        // 기준일 (1-31)
  income: string;         // 월 수입
  
  // 날짜 관련
  startDate: string;      // 시작 날짜 (YYYYMMDD)
  endDate: string;        // 종료 날짜 (YYYYMMDD)
  
  // 추천 기준 (거래 내역 부족 시)
  useAge: boolean | null;     // 비슷한 연령대 사용 여부
  useGender: boolean | null;  // 같은 성별 사용 여부
  incomeLevel: string; // 수입 레벨 (A~G)
  
  // 추천 결과
  recommendationResult: SlotRecommendationResponse | null;
}

interface SlotDivideStore {
  // 데이터
  data: SlotDivideData;
  
  // 액션
  setBaseDay: (day: string) => void;
  getBaseDay: () => string;
  setIncome: (income: string) => void;
  
  // 날짜 관련 액션
  setDates: (startDate: string, endDate: string) => void;
  getStartDate: () => string;
  getEndDate: () => string;
  
  // 추천 기준 액션
  setUseAge: (useAge: boolean | null) => void;
  setUseGender: (useGender: boolean | null) => void;
  setIncomeLevel: (incomeLevel: string) => void;
  getUseAge: () => boolean | null;
  getUseGender: () => boolean | null;
  getIncomeLevel: () => string;
  
  // 전체 데이터 설정
  setData: (data: Partial<SlotDivideData>) => void;
  
  // 데이터 초기화
  reset: () => void;
  
  // API 호출용 데이터 가져오기
  getApiData: () => SlotDivideData;
  
  // 추천 결과 관련 액션
  setRecommendationResult: (result: SlotRecommendationResponse | null) => void;
  getRecommendationResult: () => SlotRecommendationResponse | null;
  clearRecommendationResult: () => void;
}

const initialData: SlotDivideData = {
  baseDay: '',
  income: '',
  startDate: '',
  endDate: '',
  useAge: null,
  useGender: null,
  incomeLevel: '',
  recommendationResult: null,
};

export const useSlotDivideStore = create<SlotDivideStore>((set, get) => ({
  data: initialData,
  
  setBaseDay: (day: string) => 
    set((state) => ({
      data: { ...state.data, baseDay: day }
    })),
  
  getBaseDay: () => {
    const { data } = get();
    return data.baseDay;
  },
  
  setIncome: (income: string) => 
    set((state) => ({
      data: { ...state.data, income: income }
    })),
  
  // 날짜 관련 액션
  setDates: (startDate: string, endDate: string) => 
    set((state) => ({
      data: { ...state.data, startDate, endDate }
    })),
  
  getStartDate: () => {
    const { data } = get();
    return data.startDate;
  },
  
  getEndDate: () => {
    const { data } = get();
    return data.endDate;
  },
  
  // 추천 기준 액션
  setUseAge: (useAge: boolean | null) => 
    set((state) => ({
      data: { ...state.data, useAge }
    })),
  
  setUseGender: (useGender: boolean | null) => 
    set((state) => ({
      data: { ...state.data, useGender }
    })),
  
  setIncomeLevel: (incomeLevel: string) => 
    set((state) => ({
      data: { ...state.data, incomeLevel }
    })),
  
  getUseAge: () => {
    const { data } = get();
    return data.useAge;
  },
  
  getUseGender: () => {
    const { data } = get();
    return data.useGender;
  },
  
  getIncomeLevel: () => {
    const { data } = get();
    return data.incomeLevel;
  },
  
  setData: (newData: Partial<SlotDivideData>) => 
    set((state) => ({
      data: { ...state.data, ...newData }
    })),
  
  reset: () => 
    set({ data: initialData }),
  
  getApiData: () => {
    const { data } = get();
    return { ...data };
  },
  
  // 추천 결과 관련 액션
  setRecommendationResult: (result: SlotRecommendationResponse | null) => 
    set((state) => ({
      data: { ...state.data, recommendationResult: result }
    })),
  
  getRecommendationResult: () => {
    const { data } = get();
    return data.recommendationResult;
  },
  
  clearRecommendationResult: () => 
    set((state) => ({
      data: { ...state.data, recommendationResult: null }
    })),
}));
