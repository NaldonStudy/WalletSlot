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
    const res = await apiClient.get(API_ENDPOINTS.MYDATA_CONSENTS, { params: status ? { status } : undefined });
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
};
