import { apiClient } from '@/src/api/client';
import { 
  User, 
  UserDevice, 
  LoginForm, 
  RegisterForm, 
  PhoneVerificationForm,
  AccountVerificationForm,
  PasswordForm,
  AuthTokens,
  BaseResponse 
} from '@/src/types';

/**
 * 인증 관련 API 서비스
 */
export const authApi = {
  /**
   * 로그인
   */
  login: async (data: LoginForm): Promise<BaseResponse<{ user: User; tokens: AuthTokens }>> => {
    return apiClient.post('/auth/login', data);
  },

  /**
   * 토큰 갱신
   */
  refreshToken: async (refreshToken: string): Promise<BaseResponse<AuthTokens>> => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  /**
   * 회원가입 - 기본 정보 등록
   */
  register: async (data: RegisterForm): Promise<BaseResponse<{ userId: number }>> => {
    return apiClient.post('/auth/register', data);
  },

  /**
   * 휴대폰 인증 코드 발송
   */
  sendPhoneVerification: async (phoneNumber: string): Promise<BaseResponse<void>> => {
    return apiClient.post('/auth/phone/send', { phoneNumber });
  },

  /**
   * 휴대폰 인증 코드 확인
   */
  verifyPhone: async (data: PhoneVerificationForm): Promise<BaseResponse<void>> => {
    return apiClient.post('/auth/phone/verify', data);
  },

  /**
   * 계좌 1원 인증 요청
   */
  requestAccountVerification: async (data: { accountNumber: string; bankCode: string }): Promise<BaseResponse<void>> => {
    return apiClient.post('/auth/account/verify-request', data);
  },

  /**
   * 계좌 1원 인증 확인
   */
  verifyAccount: async (data: AccountVerificationForm): Promise<BaseResponse<void>> => {
    return apiClient.post('/auth/account/verify', data);
  },

  /**
   * 간편 비밀번호 설정
   */
  setPassword: async (data: PasswordForm): Promise<BaseResponse<void>> => {
    return apiClient.post('/auth/password/set', data);
  },

  /**
   * 간편 비밀번호 변경
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<BaseResponse<void>> => {
    return apiClient.post('/auth/password/change', data);
  },

  /**
   * FCM 토큰 등록/갱신
   */
  updateFcmToken: async (data: { deviceUuid: string; fcmToken: string; platform: string }): Promise<BaseResponse<void>> => {
    return apiClient.post('/auth/fcm-token', data);
  },

  /**
   * 기기 정보 등록
   */
  registerDevice: async (data: { deviceUuid: string; fcmToken: string; platform: string }): Promise<BaseResponse<UserDevice>> => {
    return apiClient.post('/auth/device', data);
  },
};
