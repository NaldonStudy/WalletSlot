import { queryKeys } from '@/src/api/queryKeys';
import { reportApi } from '@/src/api/report';
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
 * 
 * @param enabled 쿼리 활성화 여부 (기본값: true, 계좌 로딩 완료 후 활성화 권장)
 * @returns TanStack Query 결과 객체 (data, isLoading, error, refetch 등)
 */
export const useSpendingReport = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.reports.spending(),
    queryFn: async (): Promise<SpendingReport> => {
      const result = await reportApi.getSpendingReport();
      
      if (!result) {
        throw new Error('소비 레포트 데이터가 없습니다.');
      }
      
      // 필수 필드 검증
      if (!result.period || !result.budgetComparison || !result.categoryAnalysis) {
        throw new Error('소비 레포트 데이터가 완전하지 않습니다.');
      }
      
      return result;
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000,   // 10분간 가비지 컬렉션 방지
    retry: __DEV__ ? 1 : 2,   // 개발 환경에서는 1회만 재시도
    retryDelay: (attemptIndex) => __DEV__ ? 500 : Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};