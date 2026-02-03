import { API_ENDPOINTS } from '@/src/constants/api';
import { apiClient } from './client';
import { fetchJsonFallback, isAmbiguousAxiosBody } from './responseNormalizer';

export interface ConsentCreateRequestDto {
  consentFormUuid: string;
  expiredAt?: string; // ISO date-time
}
export interface ConsentCreateResponseDto {
  userConsentUuid: string;
  consentFormUuid: string;
  consentFormTitle: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  agreedAt: string;
  expiredAt: string;
}

export interface ConsentListItemDto {
  userConsentUuid: string;
  consentFormUuid: string;
  consentFormTitle: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  agreedAt: string;
  expiredAt: string;
  revokedAt?: string | null;
}

export interface ConsentListResponseDto {
  consents: ConsentListItemDto[];
}

export interface ConsentRevokeRequestDto {
  userConsentUuid: string;
}
export interface ConsentRevokeResponseDto {
  userConsentUuid: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  revokedAt: string;
}

export interface ConsentRenewRequestDto {
  previousUserConsentUuid?: string;
  consentFormUuid?: string;
  expiredAt?: string;
}
export interface ConsentRenewResponseDto {
  newUserConsentUuid: string;
  consentFormUuid: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  agreedAt: string;
  expiredAt: string;
}

export const mydataApi = {
  createConsent: async (req: ConsentCreateRequestDto): Promise<ConsentCreateResponseDto> => {
    const res = await apiClient.post(API_ENDPOINTS.MYDATA_CONSENTS, req);
    const data = (res as any).data || res;
    return data?.data as ConsentCreateResponseDto;
  },
  listConsents: async (status?: 'ACTIVE' | 'EXPIRED' | 'REVOKED'): Promise<ConsentListItemDto[]> => {
    const params = status ? { status } : undefined;
    const res = await apiClient.get(API_ENDPOINTS.MYDATA_CONSENTS, params);
    if (isAmbiguousAxiosBody(res)) {
      const fb = await fetchJsonFallback(API_ENDPOINTS.MYDATA_CONSENTS + (status ? `?status=${status}` : ''));
      return (fb?.data?.consents || []) as ConsentListItemDto[];
    }
    const data = (res as any).data || res;
    return (data?.data?.consents || []) as ConsentListItemDto[];
  },
  revokeConsent: async (req: ConsentRevokeRequestDto): Promise<ConsentRevokeResponseDto> => {
    const res = await apiClient.post(API_ENDPOINTS.MYDATA_CONSENTS_REVOKE, req);
    const data = (res as any).data || res;
    return data?.data as ConsentRevokeResponseDto;
  },
  renewConsent: async (req: ConsentRenewRequestDto): Promise<ConsentRenewResponseDto> => {
    const res = await apiClient.post(API_ENDPOINTS.MYDATA_CONSENTS_RENEW, req);
    const data = (res as any).data || res;
    return data?.data as ConsentRenewResponseDto;
  },
  // SSAFY 마이데이터 연동 트리거(계좌 목록)
  fetchAccounts: async () => {
    const res = await apiClient.get(API_ENDPOINTS.ACCOUNTS);
    if (isAmbiguousAxiosBody(res)) {
      const fb = await fetchJsonFallback(API_ENDPOINTS.ACCOUNTS);
      return fb?.data?.accounts || [];
    }
    const data = (res as any).data || res;
    return data?.data?.accounts || [];
  },
  // 사용자 마이데이터 연결(계좌) 조회
  getConnections: async () => {
    const path = API_ENDPOINTS.USER_ME + '/mydata/connections';
    try {
      const res = await apiClient.get(path);
      if (isAmbiguousAxiosBody(res)) {
        const fb = await fetchJsonFallback(path);
        return fb?.data || [];
      }
      const data = (res as any).data || res;
      return data?.data || [];
    } catch (err) {
      console.warn('[MYDATA_API] getConnections failed, falling back', err);
      const fb = await fetchJsonFallback(path);
      return fb?.data || [];
    }
  },
  addConnection: async (payload: any) => {
    const path = API_ENDPOINTS.USER_ME + '/mydata/connections';
    const res = await apiClient.post(path, payload);
    const data = (res as any).data || res;
    return data?.data;
  },
  deleteConnection: async (accountId: string) => {
    const path = API_ENDPOINTS.USER_ME + `/mydata/connections/${accountId}`;
    const res = await apiClient.delete(path);
    const data = (res as any).data || res;
    return data?.data;
  },
};
