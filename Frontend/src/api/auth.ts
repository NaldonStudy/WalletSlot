import { apiClient } from '@/src/api/client';
import {
  AccountVerificationRequestRequest,
  AccountVerificationRequestResponse,
  AccountVerificationVerifyRequest,
  AccountVerificationVerifyResponse,
  CompleteSignupRequest,
  CompleteSignupResponse,
  SmsSendRequest,
  SmsSendResponse,
  SmsVerifyRequest,
  SmsVerifyResponse,
  SmsVerifySignupRequest,
  SmsVerifySignupResponse,
} from '@/src/types';

/**
 * 인증 관련 API 서비스
 */
export const authApi = {
  /**
   * SMS 인증코드 발송
   * POST /api/auth/sms/send
   */
  sendSms: async (data: SmsSendRequest): Promise<SmsSendResponse> => {
    return apiClient.post('/api/auth/sms/send', data);
  },

  /**
   * 가입용 SMS 검증
   * POST /api/auth/sms/verify-signup
   */
  verifySmsSignup: async (data: SmsVerifySignupRequest): Promise<SmsVerifySignupResponse> => {
    return apiClient.post('/api/auth/sms/verify-signup', data);
  },

  /**
   * 로그인/공통 SMS 검증
   * POST /api/auth/sms/verify
   */
  verifySms: async (data: SmsVerifyRequest): Promise<SmsVerifyResponse> => {
    return apiClient.post('/api/auth/sms/verify', data);
  },
  /**
   * 1원 인증 요청
   * POST /api/accounts/verification/request
   */
  requestAccountVerification: async (
    data: AccountVerificationRequestRequest,
  ): Promise<AccountVerificationRequestResponse> => {
    return apiClient.postNoAuth('/api/accounts/verification/request', data);
  },

  /**
   * 1원 인증 검증
   * POST /api/accounts/verification/verify
   */
  verifyAccountVerification: async (
    data: AccountVerificationVerifyRequest,
  ): Promise<AccountVerificationVerifyResponse> => {
    return apiClient.postNoAuth('/api/accounts/verification/verify', data);
  },

  /**
   * 회원가입 완료
   * POST /api/auth/signup
   */
  completeSignup: async (data: CompleteSignupRequest): Promise<CompleteSignupResponse> => {
    return apiClient.post('/api/auth/signup', data);
  },
};
