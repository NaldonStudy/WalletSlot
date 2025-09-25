import { API_ENDPOINTS } from '@/src/constants/api';
import { apiClient } from './client';
import { fetchJsonFallback, isAmbiguousAxiosBody } from './responseNormalizer';

// ===== 타입 정의 =====
export interface Device {
  deviceId: string;
  platform: 'ANDROID' | 'IOS';
  status: 'ACTIVE' | 'LOGGED_OUT' | 'ACCOUNT_LOCKED' | 'USER_WITHDRAW';
  pushEnabled: boolean;
  tokenPresent: boolean;
}

export interface LinkedAccount {
  accountId: string;
  bankId: string;
  bankName: string;
  accountNo: string;
  alias: string;
  balance: number;
}

export interface UpdateDeviceRequest {
  remoteLogout?: boolean;
  pushEnabled?: boolean;
  token?: string;
  platform?: 'ANDROID' | 'IOS';
  status?: 'ACTIVE' | 'LOGGED_OUT' | 'ACCOUNT_LOCKED' | 'USER_WITHDRAW';
}

export interface PinChangeRequest {
  currentPin: string;
  newPin: string;
}

// ===== API 함수들 =====

/**
 * 내 디바이스 목록 조회
 */
export const getDevices = async (): Promise<Device[]> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.DEVICES);
    
    // axios 응답이 모호한 경우 fallback 사용
    if (isAmbiguousAxiosBody(response)) {
      const fallbackData = await fetchJsonFallback(API_ENDPOINTS.DEVICES);
      return fallbackData?.data?.devices || [];
    }
    
    const data = response.data || response;
    return (data as any)?.data?.devices || [];
  } catch (error) {
    console.warn('[SETTINGS_API] getDevices axios 실패, fallback 시도');
    const fallbackData = await fetchJsonFallback(API_ENDPOINTS.DEVICES);
    return fallbackData?.data?.devices || [];
  }
};

/**
 * 디바이스 설정 업데이트 (푸시 알림 on/off 등)
 */
export const updateDevice = async (deviceId: string, request: UpdateDeviceRequest): Promise<Device> => {
  try {
    const response = await apiClient.patch(API_ENDPOINTS.DEVICE_BY_ID(deviceId), request);
    
    // axios 응답이 모호한 경우 처리
    if (isAmbiguousAxiosBody(response)) {
      throw new Error('Ambiguous axios response, need fallback');
    }
    
    const data = response.data || response;
    return (data as any).data?.device;
  } catch (error) {
    console.warn('[SETTINGS_API] updateDevice 실패:', error);
    throw error;
  }
};

/**
 * 디바이스 삭제 (연동 해지)
 */
export const deleteDevice = async (deviceId: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.DEVICE_BY_ID(deviceId));
};

/**
 * PIN 변경
 */
export const changePin = async (request: PinChangeRequest): Promise<void> => {
  await apiClient.patch(API_ENDPOINTS.PIN_CHANGE, request);
};

/**
 * 생체 인증 설정(활성화/비활성화)
 */
export const setBiometric = async (enabled: boolean): Promise<boolean> => {
  const res = await apiClient.patch<{ biometric?: boolean }>(`${API_ENDPOINTS.USER_ME}/settings/biometric`, { enabled });
  return !!(res && res.success && (res.data?.biometric ?? enabled));
};

/**
 * 연동된 계좌 목록 조회 (UserAccount를 LinkedAccount로 변환)
 */
export const getLinkedAccounts = async (): Promise<LinkedAccount[]> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ACCOUNTS_LINK);
    
    // axios 응답이 모호한 경우 fallback 사용
    if (isAmbiguousAxiosBody(response)) {
      const fallbackData = await fetchJsonFallback(API_ENDPOINTS.ACCOUNTS_LINK);
      const userAccounts = fallbackData?.data?.accounts || [];
      return convertUserAccountsToLinkedAccounts(userAccounts);
    }
    
    const data = response.data || response;
    const userAccounts = (data as any)?.data?.accounts || [];
    return convertUserAccountsToLinkedAccounts(userAccounts);
  } catch (error) {
    console.warn('[SETTINGS_API] getLinkedAccounts axios 실패, fallback 시도');
    const fallbackData = await fetchJsonFallback(API_ENDPOINTS.ACCOUNTS_LINK);
    const userAccounts = fallbackData?.data?.accounts || [];
    return convertUserAccountsToLinkedAccounts(userAccounts);
  }
};

/**
 * UserAccount[]를 LinkedAccount[]로 변환하는 헬퍼 함수
 */
function convertUserAccountsToLinkedAccounts(userAccounts: any[]): LinkedAccount[] {
  return userAccounts.map(account => ({
    accountId: account.accountId,
    bankId: account.bankId,
    bankName: account.bankName,
    accountNo: account.accountNo,
    alias: account.alias || '연동된 계좌',
    balance: Number(account.accountBalance || 0),
  }));
}

/**
 * 연동된 계좌 삭제
 */
export const deleteLinkedAccount = async (accountId: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ACCOUNT_BY_ID(accountId));
};

/**
 * 마이데이터 재연동 (계좌 목록 새로고침)
 */
export const refreshMyData = async (): Promise<LinkedAccount[]> => {
  try {
  const response = await apiClient.get(API_ENDPOINTS.ACCOUNTS);
    
    // axios 응답이 모호한 경우 fallback 사용
    if (isAmbiguousAxiosBody(response)) {
  const fallbackData = await fetchJsonFallback(API_ENDPOINTS.ACCOUNTS);
      const userAccounts = fallbackData?.data?.accounts || [];
      return convertUserAccountsToLinkedAccounts(userAccounts);
    }
    
    const data = response.data || response;
    const userAccounts = (data as any)?.data?.accounts || [];
    return convertUserAccountsToLinkedAccounts(userAccounts);
  } catch (error) {
    console.warn('[SETTINGS_API] refreshMyData axios 실패, fallback 시도');
  const fallbackData = await fetchJsonFallback(API_ENDPOINTS.ACCOUNTS);
    const userAccounts = fallbackData?.data?.accounts || [];
    return convertUserAccountsToLinkedAccounts(userAccounts);
  }
};