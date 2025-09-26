import { API_ENDPOINTS, USE_MSW } from '@/src/constants/api';
import { apiClient } from './client';
import { fetchJsonFallback } from './responseNormalizer';

/**
 * SpendingReport 관련 더미 생성 로직은 제거되었습니다.
 * 이 파일은 AI 아카이브(7-3) 전용 클라이언트로 사용됩니다.
 */

// SpendingReport API removed: this client uses AI archive endpoints only.
// export { getSpendingReport } removed to match backend spec.

// ==== AI Report endpoints (7-3)
export const getAiReportMonths = async (accountId: string) => {
  try {
    const url = API_ENDPOINTS.AI_REPORTS_MONTHS(accountId);
    const response = await apiClient.get(url);
    if (__DEV__) {
      try {
        console.log('[AI] getAiReportMonths -> url:', url);
        console.log('[AI] getAiReportMonths -> apiClient response shape:', response);
      } catch (e) {}
    }

    // apiClient가 반환하는 형태는 환경에 따라 달라질 수 있음
    // - Case A: BaseResponse<{ yearMonths: string[] }> 형태: { success, message, data: { yearMonths } }
    // - Case B: 직접 데이터 객체로 반환되는 경우: { yearMonths: [...] }
    if (response && typeof response === 'object') {
      if ('data' in response && response.data && typeof response.data === 'object' && 'yearMonths' in response.data) {
        return (response as any).data as { yearMonths: string[] };
      }
      if ('yearMonths' in (response as any)) {
        return response as any as { yearMonths: string[] };
      }
    }

    // fallback: 네트워크 fetch로 직접 읽어본다 (비정상 응답이면 null)
    const json = await fetchJsonFallback(url);
    if (__DEV__) console.log('[AI] getAiReportMonths -> fetchJsonFallback result:', json);
    if (json && json.data) return json.data;

    throw new Error('AI report months 데이터를 가져올 수 없습니다.');
  } catch (err) {
    if (USE_MSW) return { yearMonths: [] };
    throw err;
  }
};

export const getAiReportArchive = async (accountId: string, params?: { yearMonth?: string; offset?: number }) => {
  try {
    const base = API_ENDPOINTS.AI_REPORTS_ARCHIVE(accountId);
    const qs = [] as string[];
    if (params?.yearMonth) qs.push(`yearMonth=${encodeURIComponent(params.yearMonth)}`);
    if (typeof params?.offset === 'number') qs.push(`offset=${params.offset}`);
    const url = qs.length ? `${base}?${qs.join('&')}` : base;

    const response = await apiClient.get(url);

    // 응답 형태를 견고하게 처리
    if (response && typeof response === 'object') {
      // Case A: BaseResponse<{ reports: [...] }>
      if ('data' in response && response.data && typeof response.data === 'object' && (('reports' in response.data) || ('yearMonth' in response.data))) {
        return (response as any).data;
      }
      // Case B: response 자체가 archive 객체
      if ((response as any).reports) return response as any;
    }

    const json = await fetchJsonFallback(url);
    if (json && json.data) return json.data;

    throw new Error('AI report archive 데이터를 가져올 수 없습니다.');
  } catch (err) {
    if (USE_MSW) return { yearMonth: null, yearMonths: [], reports: [] };
    throw err;
  }
};

// export the ai helpers as part of reportApi if needed
export const aiReportApi = {
  getAiReportMonths,
  getAiReportArchive,
};