/**
 * @file responseNormalizer.ts
 * @description 백엔드/MSW 간 응답 구조 차이를 흡수하여
 * 클라이언트 상위 레이어가 단일 형태(PaginatedResponse-like)를 다루도록 정규화합니다.
 * 문자열/빈 객체로 내려오는 RN + axios + msw/native 조합의 edge case를
 * 격리하여 fallback fetch 로직을 캡슐화합니다.
 */

import type { PaginatedResponse } from '@/src/types';

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

// 기존 알림 전용 헬퍼는 호환성을 위해 유지
import type { NotificationItem } from '@/src/types';
export function normalizeNotificationList(raw: any, params?: { page?: number; limit?: number }) {
  return normalizePaginatedList<NotificationItem>(raw, params);
}

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
