import { queryKeys } from '@/src/api/queryKeys';
import type { SpendingReport } from '@/src/types/report';
import { useQuery } from '@tanstack/react-query';

/**
 * 전체 계좌 통합 소비 레포트를 조회하는 커스텀 훅
 * 
 * 주요 기능:
 * - TanStack Query 기반 데이터 캐싱 및 자동 갱신
 * - 필수 필드 검증을 통한 데이터 무결성 보장
 * - 개발/운영 환경별 재시도 정책 적용
 * - MSW 환경에서의 안정적인 폴백 처리
 * - 기간별 데이터 조회 지원 (현재 월 기준 오프셋)
 * 
 * @param enabled 쿼리 활성화 여부 (기본값: true, 계좌 로딩 완료 후 활성화 권장)
 * @param periodOffset 현재 월 기준 오프셋 (0=현재 월, -1=이전 월, -2=2개월 전...) 
 * @returns TanStack Query 결과 객체 (data, isLoading, error, refetch 등)
 */
export const useSpendingReport = (enabled: boolean = true, periodOffset: number = 0) => {
  return useQuery({
    queryKey: queryKeys.reports.spending(periodOffset),
    queryFn: async (): Promise<SpendingReport> => {
      // Legacy SpendingReport API was removed from the backend. This hook is deprecated.
      // Consumers should use `aiReportApi.getAiReportMonths` and `aiReportApi.getAiReportArchive` instead.
      // To avoid silent mismatches, throw an explicit error so callers are migrated intentionally.
      throw new Error('useSpendingReport is deprecated: migrate to aiReportApi (months/archive)');
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000,   // 10분간 가비지 컬렉션 방지
    retry: __DEV__ ? 1 : 2,   // 개발 환경에서는 1회만 재시도
    retryDelay: (attemptIndex) => __DEV__ ? 500 : Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};