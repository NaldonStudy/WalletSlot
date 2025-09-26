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
    queryFn: settingsApi.getDevices,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 연동된 계좌 목록 조회 (accounts 핸들러 사용)
 */
export const useLinkedAccounts = () => {
  return useQuery({
    queryKey: queryKeys.settings.linkedAccounts(),
    queryFn: async () => {
      const response = await fetch('/api/accounts/link');
      const data = await response.json();
      const accounts = data.data?.accounts || [];
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
    mutationFn: async (accountId: string) => {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('계좌 삭제에 실패했습니다.');
      }
      return await response.json();
    },
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
      // MOCK: 서버 호출 대신 하드코딩 데이터 반환
      return [
        {
          accountId: 'linked-acc-1',
          bankId: 'bank-001',
          bankName: '국민은행',
          accountNo: '1234567890',
          alias: '연동계좌1',
          balance: 1500000,
        },
        {
          accountId: 'linked-acc-2',
          bankId: 'bank-002',
          bankName: '신한은행',
          accountNo: '0987654321',
          alias: '연동계좌2',
          balance: 500000,
        },
      ];
    },
    onSuccess: () => {
      // 설정/대시보드 양쪽 캐시 모두 무효화하여 동기화
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.linkedAccounts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.linked() });
    },
  });
};