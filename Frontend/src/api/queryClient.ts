import { QueryClient } from '@tanstack/react-query';
import { API_CONFIG } from '@/src/constants';

/**
 * React Query 클라이언트 설정
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데이터 캐싱 시간 (5분)
      staleTime: 5 * 60 * 1000,
      // 백그라운드에서 자동 리페치 간격 (10분)
      refetchInterval: 10 * 60 * 1000,
      // 윈도우 포커스시 리페치 비활성화 (모바일에서는 불필요)
      refetchOnWindowFocus: false,
      // 재시도 설정
      retry: (failureCount, error: any) => {
        // 401, 403 에러는 재시도하지 않음
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < API_CONFIG.RETRY_COUNT;
      },
      // 재시도 지연 시간 (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // 뮤테이션 재시도 설정
      retry: (failureCount, error: any) => {
        // 클라이언트 에러(4xx)는 재시도하지 않음
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
