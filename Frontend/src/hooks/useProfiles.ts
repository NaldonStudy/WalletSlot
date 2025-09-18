/*
 * 사용자 프로필 관련 React Query 훅
 */

import { profileApi } from '@/src/api';
import { queryKeys } from '@/src/api/queryKeys';
import { BaseResponse, UserProfile } from '@/src/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// 프로필 정보 조회
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: profileApi.getUserProfile,
    staleTime: 1000 * 60 * 5, // 5분
    // ✅ CHANGED: select 옵션을 추가하여 항상 순수 UserProfile 데이터만 반환하도록 합니다.
    // 이렇게 하면 UI 컴포넌트에서 data.data.name 대신 data.name으로 바로 접근할 수 있습니다.
    select: (response: BaseResponse<UserProfile>) => response.data,
  });
};

// 프로필 정보 전체 업데이트
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      // 성공 시 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

// 이름 업데이트
export const useUpdateName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => profileApi.updateName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

// 이메일 업데이트
export const useUpdateEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => profileApi.updateEmail(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

// 직업 업데이트
export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (job: string) => profileApi.updateJob(job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

// 월 수입 업데이트
export const useUpdateMonthlyIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (monthlyIncome: number) => profileApi.updateMonthlyIncome(monthlyIncome),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};