import { queryKeys } from '@/src/api/queryKeys';
import * as settingsApi from '@/src/api/settings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ===== 조회 hooks =====

/**
 * 디바이스 목록 조회
 */
export const useDevices = () => {
  return useQuery({
    queryKey: queryKeys.settings.devices(),
    // 네트워크 호출 중단 (설정/프로필 영역 비활성화)
    queryFn: async () => [],
    staleTime: 5 * 60 * 1000,
    enabled: false,
  });
};

/**
 * 연동된 계좌 목록 조회 (accounts 핸들러 사용)
 */
export const useLinkedAccounts = () => {
  return useQuery({
    queryKey: queryKeys.settings.linkedAccounts(),
    queryFn: async () => {
      const accounts = await settingsApi.getLinkedAccounts();
      return accounts;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// ===== 변경 hooks =====

/**
 * 디바이스 설정 업데이트
 */
export const useUpdateDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ deviceId, request }: { 
      deviceId: string; 
      request: settingsApi.UpdateDeviceRequest; 
    }) => settingsApi.updateDevice(deviceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.devices() });
    },
  });
};

/**
 * 디바이스 삭제
 */
export const useDeleteDevice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: settingsApi.deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.devices() });
    },
  });
};

/**
 * PIN 변경
 */
export const useChangePin = () => {
  return useMutation({
    mutationFn: settingsApi.changePin,
  });
};

/**
 * 연동된 계좌 삭제
 */
export const useDeleteLinkedAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (accountId: string) => settingsApi.deleteLinkedAccount(accountId),
    onSuccess: (data, accountId) => {
      // 낙관적 업데이트: 캐시에서 직접 제거 (가장 빠른 UI 반영)
      queryClient.setQueryData(queryKeys.settings.linkedAccounts(), (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.filter((account: any) => account.accountId !== accountId);
      });
      // 대시보드에서 사용하는 계정 캐시도 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.linked() });
    },
    onError: (error, accountId) => {
      console.error('[DELETE_ACCOUNT] 실패:', accountId, error);
    },
  });
};

/**
 * 마이데이터 재연동
 */
export const useRefreshMyData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const accounts = await settingsApi.refreshMyData();
      return accounts;
    },
    onSuccess: () => {
      // 설정/대시보드 양쪽 캐시 모두 무효화하여 동기화
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.linkedAccounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.linked() });
    },
  });
};