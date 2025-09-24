import { apiClient } from '@/src/api/client';
import { 
  UserAccount, 
  AccountsResponse,
  Transaction, 
  TransactionCategory,
  PaginatedResponse,
  BaseResponse
} from '@/src/types';
import { isAmbiguousAxiosBody, fetchAccountsFallback, fetchAccountBalanceFallback } from './responseNormalizer';

/**
 * 계좌 관련 API 서비스
 */
export const accountApi = {

  /**
   * 사용자 연동 계좌 목록 조회
   */
  getLinkedAccounts: async (): Promise<BaseResponse<AccountsResponse>> => {
    const res = await apiClient.get('/api/accounts/link');
    return res as BaseResponse<AccountsResponse>;
  },

  /**
   * 계좌 잔액 조회
   */
  getAccountBalance: async (accountId: string): Promise<BaseResponse<{ balance: number }>> => {
    try {
      // Development Build에서 MSW 문제 해결을 위해 직접 fetch 사용
      const response = await fetch(`/api/accounts/${accountId}/balance`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data as BaseResponse<{ balance: number }>;
    } catch (error) {
      try {
        // Fallback: 기존 axios 방식
        const res = await apiClient.get<BaseResponse<{ balance: number }>>(`/api/accounts/${accountId}/balance`);

        // MSW-Axios 호환성 문제 감지 및 fallback 처리
        if (isAmbiguousAxiosBody(res.data)) {
          const fallbackResult = await fetchAccountBalanceFallback(accountId);
          if (fallbackResult) {
            return fallbackResult;
          }
        }
        
        return res.data as BaseResponse<{ balance: number }>;
      } catch (axiosError) {
        console.error('[getAccountBalance] API 호출 실패:', axiosError instanceof Error ? axiosError.message : String(axiosError));
        throw axiosError;
      }
    }
  },

  /**
   * 마이데이터로 연동 가능한 계좌 목록 조회
   */
  getAvailableAccounts: async (): Promise<BaseResponse<UserAccount[]>> => {
    return apiClient.get('/accounts/available');
  },

  /**
   * 계좌 서비스 연동
   */
  linkAccounts: async (data: { accountIds: string[] }): Promise<BaseResponse<void>> => {
    return apiClient.post('/accounts/link', data);
  },

  /**
   * 대표계좌 설정
   */
  setMainAccount: async (accountId: string): Promise<BaseResponse<void>> => {
    return apiClient.post(`/accounts/${accountId}/set-main`);
  },

  /**
   * 계좌 상세 조회
   */
  getAccountDetail: async (accountId: string): Promise<BaseResponse<UserAccount>> => {
    return apiClient.get(`/accounts/${accountId}`);
  },


};

/**
 * 거래내역 관련 API 서비스
 */
export const transactionApi = {
  /**
   * 거래내역 조회 (전체)
   */
  getTransactions: async (params: {
    accountId?: number;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/transactions', params);
    return response as unknown as PaginatedResponse<Transaction>;
  },

  /**
   * 슬롯별 거래내역 조회
   */
  getTransactionsBySlot: async (params: {
    slotId: number;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get(`/transactions/slot/${params.slotId}`, {
      page: params.page,
      limit: params.limit,
    });
    return response as unknown as PaginatedResponse<Transaction>;
  },

  /**
   * 거래내역 슬롯 이동
   */
  transferTransaction: async (data: {
    transactionId: number;
    fromSlotId?: number;
    toSlotId: number;
  }): Promise<BaseResponse<void>> => {
    return apiClient.post('/transactions/transfer', data);
  },

  /**
   * 거래내역 분할 (더치페이)
   * 내 몫은 지정한 슬롯에, 나머지 금액은 자동으로 "미분류" 슬롯에 배정
   */
  splitTransaction: async (data: {
    transactionId: number;
    totalAmount: number;       // 원래 거래 총액
    userAmount: number;        // 내가 실제 부담한 금액
    userSlotId: number;        // 내 몫을 배정할 슬롯
    unclassifiedSlotId: number; // 미분류 슬롯 ID (나머지 금액이 들어갈 곳)
    description?: string;       // 분할 사유 (예: "친구들과 더치페이")
  }): Promise<BaseResponse<{
    userTransaction: Transaction;        // 내 몫 거래 내역
    unclassifiedTransaction: Transaction; // 미분류된 나머지 거래 내역
  }>> => {
    return apiClient.post('/transactions/split', data);
  },

  /**
   * OCR을 통한 영수증 분할
   * 분할된 항목들의 총합이 원래 거래 금액과 다를 경우, 차액은 미분류 슬롯에 자동 배정
   */
  splitByReceipt: async (data: {
    transactionId: number;
    receiptImage: FormData;
    splits: Array<{
      itemName: string;
      amount: number;
      slotId: number;
    }>;
    unclassifiedSlotId: number; // 미분류 슬롯 ID
  }): Promise<BaseResponse<{
    splitTransactions: Transaction[];    // 분할된 각 항목의 거래 내역
    unclassifiedTransaction?: Transaction; // 차액이 있을 경우 미분류 거래 내역
    totalSplitAmount: number;            // 분할된 항목들의 총합
    originalAmount: number;              // 원래 거래 금액
    difference: number;                  // 차액 (미분류 슬롯에 들어간 금액)
  }>> => {
    // 영수증 이미지 업로드 후 분할 처리
    const ocrResult = await apiClient.upload('/transactions/ocr', data.receiptImage);
    return apiClient.post('/transactions/split-receipt', {
      transactionId: data.transactionId,
      splits: data.splits,
      unclassifiedSlotId: data.unclassifiedSlotId,
    });
  },
};

/**
 * 거래 카테고리 관련 API 서비스
 */
export const transactionCategoryApi = {
  /**
   * 모든 거래 카테고리 조회 (표준 카테고리)
   */
  getAllCategories: async (): Promise<BaseResponse<TransactionCategory[]>> => {
    return apiClient.get('/transaction-categories');
  },

  /**
   * 거래 카테고리 변경 (사용자 직접 재분류)
   */
  updateTransactionCategory: async (data: {
    transactionId: number;
    newCategoryId: number;
    shouldRememberRule?: boolean;  // "앞으로도 이 지출 항목에 대해 XX 카테고리로 지정하기" 체크박스
    merchantKeyword?: string;      // 가맹점명이나 거래 설명의 핵심 키워드
  }): Promise<BaseResponse<void>> => {
    return apiClient.put(`/transactions/${data.transactionId}/category`, data);
  },

  /**
   * 사용자 맞춤 분류 규칙 조회
   * (사용자가 "앞으로도 이렇게 분류해줘"라고 설정한 규칙들)
   */
  getUserClassificationRules: async (): Promise<BaseResponse<Array<{
    ruleId: number;
    keyword: string;           // 예: "스타벅스"
    categoryId: number;        // 예: 카페 카테고리 ID
    categoryName: string;      // 예: "카페/음료"
    createdAt: string;
    lastUsedAt: string;
  }>>> => {
    return apiClient.get('/transaction-categories/user-rules');
  },

  /**
   * 사용자 맞춤 분류 규칙 삭제
   */
  deleteClassificationRule: async (ruleId: number): Promise<BaseResponse<void>> => {
    return apiClient.delete(`/transaction-categories/user-rules/${ruleId}`);
  },

  /**
   * 새 카테고리 추가 요청 (개발팀 검토 후 반영)
   * 정말 필요한 경우에만 사용
   */
  requestNewCategory: async (data: {
    categoryName: string;
    description: string;
    exampleTransactions: string[];  // 예시 거래 내역들
    frequency: 'high' | 'medium' | 'low';  // 예상 사용 빈도
  }): Promise<BaseResponse<{ requestId: number }>> => {
    return apiClient.post('/transaction-categories/new-category-request', data);
  },
};
