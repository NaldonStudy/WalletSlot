import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, queryKeys } from '@/src/api';
import type { User, LoginForm, AuthTokens } from '@/src/types';

/**
 * 인증 관련 커스텀 훅 (기본 틀)
 * 추후 상태 관리 라이브러리 연결 예정
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  
  // TODO: 실제 상태 관리 연결 필요
  const user: User | null = null;
  const isLoading = false;

  // 로그인 뮤테이션
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { user, tokens } = response.data;
      // TODO: 상태 관리에 저장
      console.log('Login success:', user);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // 토큰 갱신 뮤테이션
  const refreshTokenMutation = useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (response) => {
      const tokens = response.data;
      // TODO: 토큰 저장
      console.log('Token refreshed:', tokens);
    },
  });

  // 로그아웃 (상태 초기화)
  const logout = () => {
    // TODO: 상태 초기화
    queryClient.clear(); // 모든 캐시 데이터 삭제
  };

  return {
    // 상태
    user,
    isAuthenticated: !!user,
    isLoading,
    
    // 액션
    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    
    refreshToken: refreshTokenMutation.mutate,
    isRefreshLoading: refreshTokenMutation.isPending,
    
    logout,
    
    // 유틸리티
    hasPermission: (permission: string) => {
      // 권한 체크 로직 추가 예정
      return !!user;
    },
  };
};
