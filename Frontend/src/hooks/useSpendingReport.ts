import { queryKeys } from '@/src/api/queryKeys';
import { reportApi } from '@/src/api/report';
import type { SpendingReport } from '@/src/types/report';
import { useQuery } from '@tanstack/react-query';

/**
 * 전체 계좌 통합 소비 레포트 조회 훅
 * @param enabled 쿼리 활성화 여부 (기본값: true)
 */
export const useSpendingReport = (enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.reports.spending(),
    queryFn: async (): Promise<SpendingReport> => {
      console.log('[useSpendingReport] 쿼리 함수 실행 (전체 계좌 통합)');
      
      const result = await reportApi.getSpendingReport();
      console.log('[useSpendingReport] API 결과:', result);
      
      if (!result) {
        throw new Error('소비 레포트 데이터가 없습니다.');
      }
      
      // 필수 필드 검증
      if (!result.period || !result.budgetComparison || !result.categoryAnalysis) {
        console.error('[useSpendingReport] 필수 필드 누락:', result);
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