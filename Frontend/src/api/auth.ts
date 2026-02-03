import { apiClient } from '@/src/api/client';
import { API_ENDPOINTS } from '@/src/constants/api';
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
    return apiClient.post(API_ENDPOINTS.AUTH_LOGIN_FULL, data);
  },

  /**
   * SMS 인증코드 발송
   * POST /api/auth/sms/send
   */
  sendSms: async (data: SmsSendRequest): Promise<SmsSendResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH_SMS_SEND, data);
  },

  /**
   * 가입용 SMS 검증
   * POST /api/auth/sms/verify-signup
   */
  verifySmsSignup: async (data: SmsVerifySignupRequest): Promise<SmsVerifySignupResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH_SMS_VERIFY_SIGNUP, data);
  },

  /**
   * 로그인/공통 SMS 검증
   * POST /api/auth/sms/verify
   */
  verifySms: async (data: SmsVerifyRequest): Promise<SmsVerifyResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH_SMS_VERIFY, data);
  },

  /**
   * PIN 재설정
   * POST /api/auth/password/reset
   */
  resetPin: async (data: ResetPinRequest): Promise<ResetPinResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH_PASSWORD_RESET, data);
  },

  /**
   * PIN 재설정 요청 (SMS 발송)
   * POST /api/auth/password/reset-request
   */
  requestPinReset: async (data: RequestPinResetRequest): Promise<RequestPinResetResponse> => {
    return apiClient.post(API_ENDPOINTS.AUTH_PASSWORD_RESET_REQUEST, data);
  },
  /**
   * 1원 인증 요청
   * POST /api/accounts/verification/request
   */
  requestAccountVerification: async (
    data: AccountVerificationRequestRequest,
  ): Promise<AccountVerificationRequestResponse> => {
  return apiClient.postNoAuth(API_ENDPOINTS.ACCOUNTS_VERIFICATION_REQUEST, data);
  },

  /**
   * 1원 인증 검증
   * POST /api/accounts/verification/verify
   */
  verifyAccountVerification: async (
    data: AccountVerificationVerifyRequest,
  ): Promise<AccountVerificationVerifyResponse> => {
  return apiClient.postNoAuth(API_ENDPOINTS.ACCOUNTS_VERIFICATION_VERIFY, data);
  },

  /**
   * 회원가입 완료
   * POST /api/auth/signup
   */
  completeSignup: async (data: CompleteSignupRequest): Promise<CompleteSignupResponse> => {
    return apiClient.postWithConfig(API_ENDPOINTS.AUTH_SIGNUP, data, { skipAuth: true, disableRetry: true });
  },
  
  refresh: async (data: { refreshToken: string; deviceId: string }) => {
    return apiClient.post(API_ENDPOINTS.AUTH_REFRESH, data);
  },
  logout: async (data: { refreshToken: string; deviceId: string }) => {
    return apiClient.post(API_ENDPOINTS.AUTH_LOGOUT, data);
  },
  /**
   * PIN 검증
   * POST /api/auth/pin/verify
   */
  verifyPin: async (data: { pin: string }) => {
    return apiClient.post<{ valid?: boolean }>(`${API_ENDPOINTS.PIN_CHANGE}/verify`, data);
  },
};
