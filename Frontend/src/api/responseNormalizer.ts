/**
 * @file responseNormalizer.ts
 * @description 백엔드/MSW 간 응답 구조 차이를 흡수하여
 * 클라이언트 상위 레이어가 단일 형태(PaginatedResponse-like)를 다루도록 정규화합니다.
 * 문자열/빈 객체로 내려오는 RN + axios + msw/native 조합의 edge case를
 * 격리하여 fallback fetch 로직을 캡슐화합니다.
 */

import type { NotificationItem, PaginatedResponse, UserAccount, BaseResponse, AccountsResponse, SlotsResponse, SlotData } from '@/src/types';

/** 알림 목록 응답 형태 후보 타입 (느슨한 any 구조) */
export type RawNotificationListResponse = any; // 다양한 케이스 수용

/** 계좌 목록 응답 형태 후보 타입 (느슨한 any 구조) */
export type RawAccountListResponse = any; // 다양한 케이스 수용

/** 계좌 잔액 응답 형태 후보 타입 (느슨한 any 구조) */
export type RawAccountBalanceResponse = any; // 다양한 케이스 수용

/** 슬롯 목록 응답 형태 후보 타입 (느슨한 any 구조) */
export type RawSlotsResponse = any; // 다양한 케이스 수용

/**
 * 알림 목록 응답을 표준 형태로 변환합니다.
 * @param raw 서버 또는 MSW, 혹은 fallback fetch로부터 수신한 원본 응답
 * @param params 요청 파라미터(페이지/리밋 등) - 메타 보정용
 */
export function normalizeNotificationList(
  raw: RawNotificationListResponse,
  params?: { page?: number; limit?: number }
): PaginatedResponse<NotificationItem> {
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
      message: raw.message || '알림 목록 조회 완료',
      meta: {
        page: paginationSource.currentPage || page,
        limit: raw.meta?.limit || limit,
        total: paginationSource.totalItems ?? raw.meta?.total ?? raw.data.length,
        hasNext: paginationSource.hasNextPage ?? raw.meta?.hasNext ?? false
      }
    };
  }

  // Case B: BaseResponse<NotificationItem[]> (data 배열)
  if (raw && Array.isArray(raw.data)) {
    return {
      success: true,
      data: raw.data,
      message: raw.message || '알림 목록 조회 완료',
      meta: { page, limit, total: raw.data.length, hasNext: false }
    };
  }

  // Case C: 배열 자체가 응답
  if (Array.isArray(raw)) {
    return {
      success: true,
      data: raw,
      message: '알림 목록 조회 완료',
      meta: { page, limit, total: raw.length, hasNext: false }
    };
  }

  // Case D: 문자열/빈 객체 => 빈 결과
  return {
    success: true,
    data: [],
    message: '알림 목록 조회 완료',
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
 * Fallback fetch를 수행하여 확실한 JSON을 확보.
 * 네트워크/파싱 성공 시 정규화된 응답 반환, 실패 시 null 반환.
 */
export async function fetchNotificationsFallback(params?: { page?: number; limit?: number; unreadOnly?: boolean; type?: string }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.append('page', String(params.page));
  if (params?.limit) qs.append('limit', String(params.limit));
  if (params?.unreadOnly) qs.append('unreadOnly', 'true');
  if (params?.type) qs.append('type', params.type);
  const url = `/api/notifications${qs.toString() ? '?' + qs.toString() : ''}`;
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
    const res = await fetch('/api/accounts/link');
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
    const res = await fetch(`/api/accounts/${accountId}/balance`);
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
    const res = await fetch(`/api/accounts/${accountId}/slots`);
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
      slotName: '',
      slotIcon: '',
      slotColor: '',
      budget: 0,
      remaining: 0,
    },
  };
}

/**
 * Fallback fetch를 수행하여 확실한 JSON을 확보.
 * 네트워크/파싱 성공 시 정규화된 응답 반환, 실패 시 null 반환.
 */
export async function fetchSlotDetailFallback(slotId: string): Promise<BaseResponse<SlotData> | null> {
  try {
    const res = await fetch(`/api/slots/${slotId}`);
    const json = await res.json();
    if (json) {
      return normalizeSlotDetail(json);
    }
  } catch (e) {
    console.log('[SLOT_DETAIL_NORMALIZER] fallback fetch 실패:', e);
  }
  return null;
}
