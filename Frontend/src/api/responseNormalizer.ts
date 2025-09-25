/**
 * @file responseNormalizer.ts
 * @description 백엔드/MSW 간 응답 구조 차이를 흡수하여
 * 클라이언트 상위 레이어가 단일 형태(PaginatedResponse-like)를 다루도록 정규화합니다.
 * 문자열/빈 객체로 내려오는 RN + axios + msw/native 조합의 edge case를
 * 격리하여 fallback fetch 로직을 캡슐화합니다.
 */

import { API_ENDPOINTS } from '@/src/constants/api';
import type { AccountsResponse, BaseResponse, PaginatedResponse, SlotDailySpendingResponse, SlotData, SlotsResponse } from '@/src/types';

// 기존 알림 전용 헬퍼는 호환성을 위해 유지
import type { NotificationItem } from '@/src/types';

/** 알림 목록 응답 형태 후보 타입 (느슨한 any 구조) */
export type RawNotificationListResponse = any; // 다양한 케이스 수용

/** 계좌 목록 응답 형태 후보 타입 (느슨한 any 구조) */
export type RawAccountListResponse = any; // 다양한 케이스 수용

/** 계좌 잔액 응답 형태 후보 타입 (느슨한 any 구조) */
export type RawAccountBalanceResponse = any; // 다양한 케이스 수용

/** 슬롯 목록 응답 형태 후보 타입 (느슨한 any 구조) */
export type RawSlotsResponse = any; // 다양한 케이스 수용

/**
 * 느슨한 원본 응답 타입
 */
export type RawListResponse = any;

/**
 * 범용 페이징 응답 정규화 함수 (제네릭)
 * 다양한 서버/테스트 응답 형태를 흡수하여 항상 `PaginatedResponse<T>`를 반환합니다.
 */
export function normalizePaginatedList<T>(
  raw: RawListResponse,
  params?: { page?: number; limit?: number }
): PaginatedResponse<T> {
  const page = params?.page || 1;
  const limit = params?.limit || 20;

  // Case A: { data: [...], pagination: {...} }
  if (raw && raw.data && (raw.pagination || raw.meta)) {
    const paginationSource = raw.pagination || {
      currentPage: raw.meta?.page,
      totalItems: raw.meta?.total,
      hasNextPage: raw.meta?.hasNext,
      totalPages: raw.meta?.total && raw.meta?.limit ? Math.ceil(raw.meta.total / raw.meta.limit) : undefined
    };
    return {
      success: true,
      data: raw.data,
      message: raw.message || '목록 조회 완료',
      meta: {
        page: paginationSource.currentPage || page,
        limit: raw.meta?.limit || limit,
        total: paginationSource.totalItems ?? raw.meta?.total ?? (Array.isArray(raw.data) ? raw.data.length : 0),
        hasNext: paginationSource.hasNextPage ?? raw.meta?.hasNext ?? false
      }
    };
  }

  // Case B: BaseResponse<T[]> (data 배열)
  if (raw && Array.isArray(raw.data)) {
    return {
      success: true,
      data: raw.data,
      message: raw.message || '목록 조회 완료',
      meta: { page, limit, total: raw.data.length, hasNext: false }
    };
  }

  // Case C: 배열 자체가 응답
  if (Array.isArray(raw)) {
    return {
      success: true,
      data: raw,
      message: '목록 조회 완료',
      meta: { page, limit, total: raw.length, hasNext: false }
    };
  }

  // Case D: 문자열/빈 객체 => 빈 결과
  return {
    success: true,
    data: [],
    message: '목록 조회 완료',
    meta: { page, limit, total: 0, hasNext: false }
  };
}

/**
 * axios 레이어에서 빈 문자열/빈 객체가 내려오는 edge case 감지
 */
export function isAmbiguousAxiosBody(value: any) {
  if (value == null) return true;
  if (typeof value === 'string') return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * 범용 Fallback fetch: 주어진 URL에 대해 fetch를 시도하고 정규화된 결과 반환
 */
export async function fetchFallback<T = any>(url: string, params?: { page?: number; limit?: number; [key: string]: any }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.append('page', String(params.page));
  if (params?.limit) qs.append('limit', String(params.limit));
  Object.keys(params || {}).forEach((k) => {
    if (k !== 'page' && k !== 'limit' && params?.[k] != null) qs.append(k, String(params?.[k]));
  });
  const fullUrl = `${url}${qs.toString() ? '?' + qs.toString() : ''}`;
  try {
    const res = await fetch(fullUrl);
    const json = await res.json();
    if (json) {
      return normalizePaginatedList<T>(json, params);
    }
  } catch (e) {
    console.log('[NORMALIZER] fallback fetch 실패:', e);
  }
  return null;
}

/**
 * 단일 리소스용 폴백 fetch
 * @example const json = await fetchJsonFallback('/api/users/me')
 * @note 권장: 런타임에서 상수 사용 권장 (예: `fetchJsonFallback(API_CONFIG.BASE_URL + API_ENDPOINTS.USER_ME)`)
 */
export async function fetchJsonFallback(url: string) {
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json;
  } catch (e) {
    console.log('[NORMALIZER] fetchJsonFallback 실패:', e);
    return null;
  }
}
export function normalizeNotificationList(raw: any, params?: { page?: number; limit?: number }) {
  return normalizePaginatedList<NotificationItem>(raw, params);
}

export async function fetchNotificationsFallback(params?: { page?: number; limit?: number; unreadOnly?: boolean; type?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.append('page', String(params.page));
  if (params?.limit) qs.append('limit', String(params.limit));
  if (params?.unreadOnly) qs.append('unreadOnly', 'true');
  if (params?.type) qs.append('type', params.type);
  const url = `${API_ENDPOINTS.NOTIFICATIONS}${qs.toString() ? '?' + qs.toString() : ''}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json) {
      return normalizeNotificationList(json, params);
    }
  } catch (e) {
    console.log('[NOTIF_NORMALIZER] fallback fetch 실패:', e);
  }
  return null;
}

/**
 * 계좌 목록 응답을 표준 형태로 변환합니다.
 * @param raw 서버 또는 MSW, 혹은 fallback fetch로부터 수신한 원본 응답
 */
export function normalizeAccountList(raw: RawAccountListResponse): BaseResponse<AccountsResponse> {
  // Case A: { data: { accounts: [...] } } - 표준 구조
  if (raw && raw.data && raw.data.accounts && Array.isArray(raw.data.accounts)) {
    return {
      success: true,
      message: raw.message || '계좌 목록 조회 성공',
      data: {
        accounts: raw.data.accounts,
      },
    };
  }

  // Case B: { data: [...] } - 직접 배열
  if (raw && raw.data && Array.isArray(raw.data)) {
    return {
      success: true,
      message: raw.message || '계좌 목록 조회 성공',
      data: {
        accounts: raw.data,
      },
    };
  }

  // Case C: 배열 자체가 응답
  if (Array.isArray(raw)) {
    return {
      success: true,
      message: '계좌 목록 조회 성공',
      data: {
        accounts: raw,
      },
    };
  }

  // Case D: 문자열/빈 객체 => 빈 결과
  return {
    success: true,
    message: '계좌 목록 조회 성공',
    data: {
      accounts: [],
    },
  };
}

/**
 * Fallback fetch를 수행하여 확실한 JSON을 확보.
 * 네트워크/파싱 성공 시 정규화된 응답 반환, 실패 시 null 반환.
 */
export async function fetchAccountsFallback(): Promise<BaseResponse<AccountsResponse> | null> {
  try {
    const res = await fetch(API_ENDPOINTS.ACCOUNTS_LINK);
    const json = await res.json();
    if (json) {
      return normalizeAccountList(json);
    }
  } catch (e) {
    console.log('[ACCOUNT_NORMALIZER] fallback fetch 실패:', e);
  }
  return null;
}

/**
 * 계좌 잔액 응답을 표준 형태로 변환합니다.
 * @param raw 서버 또는 MSW, 혹은 fallback fetch로부터 수신한 원본 응답
 */
export function normalizeAccountBalance(raw: RawAccountBalanceResponse): BaseResponse<{ balance: number }> {
  // Case A: { data: { balance: number } } - 표준 구조
  if (raw && raw.data && typeof raw.data.balance === 'number') {
    return {
      success: true,
      message: raw.message || '계좌 잔액 조회 성공',
      data: {
        balance: raw.data.balance,
      },
    };
  }

  // Case B: { balance: number } - 직접 balance
  if (raw && typeof raw.balance === 'number') {
    return {
      success: true,
      message: raw.message || '계좌 잔액 조회 성공',
      data: {
        balance: raw.balance,
      },
    };
  }

  // Case C: 문자열/빈 객체 => 기본값
  return {
    success: true,
    message: '계좌 잔액 조회 성공',
    data: {
      balance: 0,
    },
  };
}

/**
 * Fallback fetch를 수행하여 확실한 JSON을 확보.
 * 네트워크/파싱 성공 시 정규화된 응답 반환, 실패 시 null 반환.
 */
export async function fetchAccountBalanceFallback(accountId: string): Promise<BaseResponse<{ balance: number }> | null> {
  try {
  const res = await fetch(API_ENDPOINTS.ACCOUNT_BALANCE(accountId));
    const json = await res.json();
    if (json) {
      return normalizeAccountBalance(json);
    }
  } catch (e) {
    console.log('[BALANCE_NORMALIZER] fallback fetch 실패:', e);
  }
  return null;
}

/**
 * 슬롯 목록 응답을 표준 형태로 변환합니다.
 * @param raw 서버 또는 MSW, 혹은 fallback fetch로부터 수신한 원본 응답
 */
export function normalizeSlots(raw: RawSlotsResponse): BaseResponse<SlotsResponse> {
  // Case A: { data: { slots: [...] } } - 표준 구조
  if (raw && raw.data && raw.data.slots && Array.isArray(raw.data.slots)) {
    return {
      success: true,
      message: raw.message || '슬롯 목록 조회 성공',
      data: {
        slots: raw.data.slots,
      },
    };
  }

  // Case B: { data: [...] } - 직접 배열
  if (raw && raw.data && Array.isArray(raw.data)) {
    return {
      success: true,
      message: raw.message || '슬롯 목록 조회 성공',
      data: {
        slots: raw.data,
      },
    };
  }

  // Case C: 배열 자체가 응답
  if (Array.isArray(raw)) {
    return {
      success: true,
      message: '슬롯 목록 조회 성공',
      data: {
        slots: raw,
      },
    };
  }

  // Case D: 문자열/빈 객체 => 빈 결과
  return {
    success: true,
    message: '슬롯 목록 조회 성공',
    data: {
      slots: [],
    },
  };
}

/**
 * Fallback fetch를 수행하여 확실한 JSON을 확보.
 * 네트워크/파싱 성공 시 정규화된 응답 반환, 실패 시 null 반환.
 */
export async function fetchSlotsFallback(accountId: string): Promise<BaseResponse<SlotsResponse> | null> {
  try {
  const res = await fetch(API_ENDPOINTS.ACCOUNT_SLOTS(accountId));
    const json = await res.json();
    if (json) {
      return normalizeSlots(json);
    }
  } catch (e) {
    console.log('[SLOTS_NORMALIZER] fallback fetch 실패:', e);
  }
  return null;
}

/**
 * 슬롯 상세 응답을 표준 형태로 변환합니다.
 * @param raw 서버 또는 MSW, 혹은 fallback fetch로부터 수신한 원본 응답
 */
export function normalizeSlotDetail(raw: RawSlotsResponse): BaseResponse<SlotData> {
  // Case A: { data: { slotId, slotName, ... } } - 표준 구조
  if (raw && raw.data && raw.data.slotId) {
    return {
      success: true,
      message: raw.message || '슬롯 상세 조회 성공',
      data: raw.data,
    };
  }

  // Case B: 직접 슬롯 객체
  if (raw && raw.slotId) {
    return {
      success: true,
      message: raw.message || '슬롯 상세 조회 성공',
      data: raw,
    };
  }

  // Case C: 문자열/빈 객체 => 기본값
  return {
    success: true,
    message: '슬롯 상세 조회 성공',
    data: {
      slotId: '',
      name: '',
      accountSlotId: '',
      customName: '',
      initialBudget: 0,
      currentBudget: 0,
      spent: 0,
      remainingBudget: 0,
      exceededBudget: 0,
      budgetChangeCount: 0,
      isSaving: false,
      isCustom: false,
      isBudgetExceeded: false,
  // Keep only known SlotData properties
    },
  };
}

/**
 * Fallback fetch를 수행하여 확실한 JSON을 확보.
 * 네트워크/파싱 성공 시 정규화된 응답 반환, 실패 시 null 반환.
 */
export async function fetchSlotDetailFallback(slotId: string): Promise<BaseResponse<SlotData> | null> {
  try {
  const res = await fetch(API_ENDPOINTS.SLOT_BY_ID(slotId));
    const json = await res.json();
    if (json) {
      return normalizeSlotDetail(json);
    }
  } catch (e) {
    console.log('[SLOT_DETAIL_NORMALIZER] fallback fetch 실패:', e);
  }
  return null;
}

/**
 * 슬롯 하루 지출 합계 응답 정규화
 */
export function normalizeSlotDailySpending(raw: any): BaseResponse<SlotDailySpendingResponse> {
  // Case A: 표준 API 응답 구조
  if (raw && raw.success !== undefined && raw.data) {
    return {
      success: raw.success,
      message: raw.message || '슬롯 하루 지출 합계 조회 성공',
      data: raw.data,
    };
  }

  // Case B: 직접 응답 객체
  if (raw && raw.startDate && raw.transactions) {
    return {
      success: true,
      message: raw.message || '슬롯 하루 지출 합계 조회 성공',
      data: raw,
    };
  }

  // Case C: 문자열/빈 객체 => 기본값
  return {
    success: true,
    message: '슬롯 하루 지출 합계 조회 성공',
    data: {
      startDate: '',
      transactions: [],
    },
  };
}

/**
 * Fallback fetch를 수행하여 확실한 JSON을 확보.
 * 네트워크/파싱 성공 시 정규화된 응답 반환, 실패 시 null 반환.
 */
export async function fetchSlotDailySpendingFallback(accountId: string, slotId: string): Promise<BaseResponse<SlotDailySpendingResponse> | null> {
  try {
  const res = await fetch(API_ENDPOINTS.ACCOUNT_SLOT_DAILY_SPENDING(accountId, slotId));
    const json = await res.json();
    if (json) {
      return normalizeSlotDailySpending(json);
    }
  } catch (e) {
    console.log('[SLOT_DAILY_SPENDING_NORMALIZER] fallback fetch 실패:', e);
  }
  return null;
}
