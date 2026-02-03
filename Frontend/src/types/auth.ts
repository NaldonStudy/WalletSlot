/**
 * 인증 관련 타입 정의
 */

// ===== SMS 인증 관련 =====

/**
 * SMS 인증코드 발송 요청
 * POST ` /api/auth/sms/send`
 * @note 코드 내에서는 `API_ENDPOINTS.AUTH_SMS_SEND` 사용 권장
 */
import type { BaseResponse } from './index';

export interface SmsSendRequest {
  phone: string;
  purpose: 'LOGIN' | 'SIGNUP' | 'FORGOT_PIN' | 'PROFILE_UPDATE' | 'DEVICE_VERIFY';
  deviceId: string;
}

/**
 * SMS 인증코드 발송 응답
 * POST ` /api/auth/sms/send`
 * @note 코드 내에서는 `API_ENDPOINTS.AUTH_SMS_SEND` 사용 권장
 */
export interface SmsSendResponse {
  success: boolean;
  data: {
    sent: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 가입용 SMS 검증 요청
 * POST ` /api/auth/sms/verify-signup`
 * @note 코드 내에서는 `API_ENDPOINTS.AUTH_SMS_VERIFY_SIGNUP` 사용 권장
 */
export interface SmsVerifySignupRequest {
  phone: string;
  purpose: 'SIGNUP' | 'LOGIN';
  code: string;
}

/**
 * 가입용 SMS 검증 응답
 * POST ` /api/auth/sms/verify-signup`
 * @note 코드 내에서는 `API_ENDPOINTS.AUTH_SMS_VERIFY_SIGNUP` 사용 권장
 */
export interface SmsVerifySignupResponse {
  success: boolean;
  data: {
    verified: boolean;
    signupTicket: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 로그인/공통 SMS 검증 요청
 * POST ` /api/auth/sms/verify`
 * @note 코드 내에서는 `API_ENDPOINTS.AUTH_SMS_VERIFY` 사용 권장
 */
export interface SmsVerifyRequest {
  phone: string;
  purpose: 'LOGIN' | 'DEVICE_VERIFY' | 'PIN_RESET' | 'SIGNUP';
  code: string;
}

/**
 * 로그인/공통 SMS 검증 응답
 * POST ` /api/auth/sms/verify`
 * @note 코드 내에서는 `API_ENDPOINTS.AUTH_SMS_VERIFY` 사용 권장
 */
export interface SmsVerifyResponse {
  success: boolean;
  data: {
    verified: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ===== 회원가입 관련 =====

/**
 * 회원가입 완료 요청
 */
export interface SignupCompleteRequest {
  signupTicket: string;
  name: string;
  phone: string;
  carrier: string;
  residentFront6: string;
  residentBack1: string;
  pin: string;
  isPushEnabled: boolean;
}

/**
 * 회원가입 완료 응답
 */
export interface SignupCompleteResponse {
  success: boolean;
  data: {
    userId: number;
    accessToken: string;
    refreshToken: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ===== 로그인 관련 =====

/**
 * 로그인 요청
 */
export interface LoginRequest {
  phone: string;
  pin: string;
  deviceId: string;
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
  success: boolean;
  data: {
    userId: number;
    accessToken: string;
    refreshToken: string;
    user: {
      userId: number;
      name: string;
      phone: string;
      isPushEnabled: boolean;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

// ===== PIN 재설정 관련 =====

/**
 * PIN 재설정 요청
 */
export interface ResetPinRequest {
  phone: string;
  resetCode: string;
  newPin: string;
}

/**
 * PIN 재설정 응답
 */
export interface ResetPinResponse {
  success: boolean;
  data: Record<string, never> | {};
  error?: {
    code: string;
    message: string;
  };
}

/**
 * PIN 재설정 요청 (SMS 발송)
 * POST /api/auth/password/reset-request
 */
export interface RequestPinResetRequest {
  phone: string;
}

export interface RequestPinResetResponse {
  success: boolean;
  data: {
    sent: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

// 계좌 인증 관련 타입
export interface AccountVerificationRequestRequest {
  bankId: string;
  accountNo: string;
  userName: string;
}

export interface AccountVerificationRequestResponse extends BaseResponse<{ authIdentifier: string }> {}

export interface AccountVerificationVerifyRequest {
  accountNo: string;
  authIdentifier: string;
  userName: string;
}

export interface AccountVerificationVerifyResponse extends BaseResponse<{ accountNo: string }> {}

// 회원가입 완료 관련 타입
export interface CompleteSignupRequest {
  name: string;
  phone: string;
  gender: 'MAN' | 'WOMAN';
  birthDate: string; // YYYY-MM-DD 형식
  signupTicket: string;
  pin: string;
  baseDay: number;
  job: 'STUDENT' | 'OFFICE_WORKER' | 'FREELANCER' | 'BUSINESS_OWNER' | 'HOUSEWIFE' | 'UNEMPLOYED' | 'OTHER' | null;
  deviceId: string;
  platform: 'ANDROID' | 'IOS';
  pushToken?: string; // FCM 토큰 (알림 허용 시에만)
  pushEnabled: boolean;
}

export interface CompleteSignupResponse extends BaseResponse<{
  userId: number;
  accessToken: string;
  refreshToken: string;
}> {}
