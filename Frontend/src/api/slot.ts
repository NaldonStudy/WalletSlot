import { apiClient } from '@/src/api/client';
import {
  BaseResponse,
  CreateSlotRequest,
  Slot,
  SlotCategory,
  SlotHistory,
  UpdateSlotBudgetRequest
} from '@/src/types';
import { fetchFallback, isAmbiguousAxiosBody, normalizePaginatedList } from './responseNormalizer';

/**
 * 슬롯 관련 API 서비스
 */
export const slotApi = {
  /**
   * 계좌별 슬롯 목록 조회
   */
  getSlotsByAccount: async (accountId: number): Promise<BaseResponse<Slot[]>> => {
    const raw = await apiClient.get(`/slots?accountId=${accountId}`) as any;
    if (isAmbiguousAxiosBody(raw)) {
      const fallback = await fetchFallback<Slot>('/slots', { accountId });
      if (fallback) return fallback;
    }
    return normalizePaginatedList<Slot>(raw) as unknown as BaseResponse<Slot[]>;
  },

  /**
   * 슬롯 상세 조회
   */
  getSlotDetail: async (slotId: number): Promise<BaseResponse<Slot>> => {
    return apiClient.get(`/slots/${slotId}`);
  },

  /**
   * 새 슬롯 생성
   */
  createSlot: async (data: CreateSlotRequest): Promise<BaseResponse<Slot>> => {
    return apiClient.post('/slots', data);
  },

  /**
   * 슬롯 예산 수정
   */
  updateSlotBudget: async (data: UpdateSlotBudgetRequest): Promise<BaseResponse<Slot>> => {
    return apiClient.put(`/slots/${data.slotId}/budget`, {
      newBudget: data.newBudget,
      reason: data.reason,
    });
  },

  /**
   * 슬롯 정보 수정 (이름, 색상 등)
   */
  updateSlot: async (slotId: number, data: {
    slotName?: string;
    color?: string;
    categoryId?: number;
  }): Promise<BaseResponse<Slot>> => {
    return apiClient.put(`/slots/${slotId}`, data);
  },

  /**
   * 슬롯 삭제
   */
  deleteSlot: async (slotId: number): Promise<BaseResponse<void>> => {
    return apiClient.delete(`/slots/${slotId}`);
  },

  /**
   * 슬롯 히스토리 조회
   */
  getSlotHistory: async (slotId: number): Promise<BaseResponse<SlotHistory[]>> => {
    const raw = await apiClient.get(`/slots/${slotId}/history`) as any;
    if (isAmbiguousAxiosBody(raw)) {
      const fallback = await fetchFallback<SlotHistory>(`/slots/${slotId}/history`);
      if (fallback) return fallback;
    }
    return normalizePaginatedList<SlotHistory>(raw) as unknown as BaseResponse<SlotHistory[]>;
  },

  /**
   * AI 기반 슬롯 추천 (신규 사용자)
   */
  getSlotRecommendations: async (data: {
    accountId: number;
    incomeLevel: string;
    age: number;
    gender: string;
  }): Promise<BaseResponse<{
    recommendedSlots: Array<{
      categoryId: number;
      slotName: string;
      recommendedBudget: number;
      reason: string;
    }>;
  }>> => {
    return apiClient.post('/slots/recommendations/new-user', data);
  },

  /**
   * 거래내역 기반 슬롯 추천 (기존 사용자)
   */
  getSlotRecommendationsFromHistory: async (data: {
    accountId: number;
    analysisMonths: number; // 분석할 개월 수 (최대 12개월)
  }): Promise<BaseResponse<{
    recommendedSlots: Array<{
      categoryId: number;
      slotName: string;
      recommendedBudget: number;
      reason: string;
    }>;
  }>> => {
    return apiClient.post('/slots/recommendations/from-history', data);
  },

  /**
   * 통합 AI 슬롯 추천 (신규/기존 사용자 모두 대응)
   * 거래내역이 있으면 우선 활용하고, 부족하면 인구통계학적 정보로 보완
   */
  getSmartSlotRecommendations: async (data: {
    accountId: number;
    // 사용자 기본 정보 (거래내역이 부족할 때 사용)
    userProfile?: {
      incomeLevel: string;
      age: number;
      gender: string;
      occupation?: string;
    };
    // 분석 설정
    analysisOptions?: {
      includeExternalAccounts?: boolean; // 연동된 외부 계좌 거래내역 포함 여부
      analysisMonths?: number; // 분석 기간 (기본 6개월)
      minTransactionCount?: number; // 추천에 필요한 최소 거래 건수
    };
  }): Promise<BaseResponse<{
    recommendedSlots: Array<{
      categoryId: number;
      slotName: string;
      recommendedBudget: number;
      reason: string;
      confidence: number; // 추천 신뢰도 (0-100)
      dataSource: 'transaction_history' | 'demographic' | 'hybrid'; // 추천 근거
    }>;
    analysisInfo: {
      totalTransactions: number;
      analysisMonths: number;
      dataQuality: 'high' | 'medium' | 'low'; // 분석에 사용된 데이터의 품질
      demographicWeight: number; // 인구통계학적 정보의 가중치 (0-100)
      historyWeight: number; // 거래내역의 가중치 (0-100)
    };
  }>> => {
    return apiClient.post('/slots/recommendations/smart', data);
  },

  /**
   * 다음 달 슬롯 예산 추천
   */
  getNextMonthBudgetRecommendations: async (accountId: number): Promise<BaseResponse<{
    recommendations: Array<{
      slotId: number;
      currentBudget: number;
      recommendedBudget: number;
      reason: string;
      changeAmount: number;
    }>;
    totalSavings: number; // 지난달 총 절약 금액
  }>> => {
    return apiClient.get(`/slots/recommendations/next-month?accountId=${accountId}`);
  },

  /**
   * 슬롯 예산 일괄 적용
   */
  applyBulkBudgetUpdate: async (data: {
    accountId: number;
    period: string; // YYYY-MM
    slots: Array<{
      slotId?: number; // 기존 슬롯
      categoryId: number;
      slotName: string;
      budget: number;
      isNew?: boolean; // 신규 슬롯 여부
    }>;
  }): Promise<BaseResponse<Slot[]>> => {
    return apiClient.post('/slots/bulk-update', data);
  },
};

/**
 * 슬롯 카테고리 관련 API 서비스
 */
export const slotCategoryApi = {
  /**
   * 모든 슬롯 카테고리 조회
   */
  getAllCategories: async (): Promise<BaseResponse<SlotCategory[]>> => {
    return apiClient.get('/slot-categories');
  },

  /**
   * 기본 슬롯 카테고리 조회
   */
  getDefaultCategories: async (): Promise<BaseResponse<SlotCategory[]>> => {
    return apiClient.get('/slot-categories/default');
  },

  /**
   * 슬롯 카테고리 상세 조회
   */
  getCategoryDetail: async (categoryId: number): Promise<BaseResponse<SlotCategory>> => {
    return apiClient.get(`/slot-categories/${categoryId}`);
  },
};
