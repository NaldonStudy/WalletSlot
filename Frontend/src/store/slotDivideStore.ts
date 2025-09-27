import { create } from 'zustand';

interface SlotDivideData {
  baseDay: string;        // 기준일 (1-31)
  income: string;         // 월 수입
  period: string;         // 분석 기간
}

interface SlotDivideStore {
  // 데이터
  data: SlotDivideData;
  
  // 액션
  setBaseDay: (day: string) => void;
  setIncome: (income: string) => void;
  setPeriod: (period: string) => void;
  
  // 전체 데이터 설정
  setData: (data: Partial<SlotDivideData>) => void;
  
  // 데이터 초기화
  reset: () => void;
  
  // API 호출용 데이터 가져오기
  getApiData: () => SlotDivideData;
}

const initialData: SlotDivideData = {
  baseDay: '',
  income: '',
  period: '',
};

export const useSlotDivideStore = create<SlotDivideStore>((set, get) => ({
  data: initialData,
  
  setBaseDay: (day: string) => 
    set((state) => ({
      data: { ...state.data, baseDay: day }
    })),
  
  setIncome: (income: string) => 
    set((state) => ({
      data: { ...state.data, income: income }
    })),
  
  setPeriod: (period: string) => 
    set((state) => ({
      data: { ...state.data, period: period }
    })),
  
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
}));
