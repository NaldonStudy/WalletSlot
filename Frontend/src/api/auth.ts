import { apiClient } from '@/src/api/client';
import {
  AccountVerificationRequestRequest,
  AccountVerificationRequestResponse,
  AccountVerificationVerifyRequest,
  AccountVerificationVerifyResponse,
  CompleteSignupRequest,
  CompleteSignupResponse,
  LoginRequest,
  LoginResponse,
  RequestPinResetRequest,
  RequestPinResetResponse,
  ResetPinRequest,
  ResetPinResponse,
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
   * 로그인 (PIN 포함 전체 로그인)
   * POST /api/auth/login/full
   */
  loginFull: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post('/api/auth/login/full', data);
  },

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
   * PIN 재설정
   * POST /api/auth/password/reset
   */
  resetPin: async (data: ResetPinRequest): Promise<ResetPinResponse> => {
    return apiClient.post('/api/auth/password/reset', data);
  },

  /**
   * PIN 재설정 요청 (SMS 발송)
   * POST /api/auth/password/reset-request
   */
  requestPinReset: async (data: RequestPinResetRequest): Promise<RequestPinResetResponse> => {
    return apiClient.post('/api/auth/password/reset-request', data);
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
    return apiClient.postWithConfig('/api/auth/signup', data, { skipAuth: true, disableRetry: true });
  },
};
