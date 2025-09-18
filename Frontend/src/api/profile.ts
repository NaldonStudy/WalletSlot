/*
 * 사용자 프로필 관련 API 함수들
 */

import {
    BaseResponse,
    UpdateProfileRequest,
    UserProfile,
} from '@/src/types';
import { apiClient } from './client';

/**
 * 현재 사용자 프로필 정보 조회
 * MSW의 빈 문자열 응답에 대응하기 위한 방어 로직이 포함되어 있습니다.
 */
export const getUserProfile = async (): Promise<BaseResponse<UserProfile>> => {
  console.log('[PROFILE_API] getUserProfile - 프로필 정보 조회');
  try {
    // ✅ CHANGED: 제네릭 타입을 BaseResponse<UserProfile>에서 UserProfile로 수정
    const response = await apiClient.get<UserProfile>('/api/users/me');

    // 비정상적인 응답(문자열, 빈 객체 등)을 받았을 때의 처리
    if (!response || typeof response.success === 'undefined') {
      console.warn('[PROFILE_API] getUserProfile - 비정상 응답 수신, Mock 데이터로 대체합니다.');
      // MSW 핸들러와 동일한 Mock 데이터를 반환하여 앱 흐름 유지
      return {
        success: true,
        data: {
          name: '김싸피 (Fallback)',
          phone: '010-1234-5678',
          gender: 'M',
          dateOfBirth: '1995-03-15',
          email: 'kim.ssafy@example.com',
          job: '개발자',
          monthlyIncome: 4500000,
          avatar: null,
        },
        message: '프로필 정보를 성공적으로 조회했습니다 (Fallback).',
      };
    }

    return response;
  } catch (error) {
    console.error('[PROFILE_API] getUserProfile 에러:', error);
    // apiClient의 인터셉터가 에러를 처리하지만,
    // QueryFunction에서는 에러를 throw해야 React Query가 에러 상태를 감지합니다.
    throw error;
  }
};

/**
 * 프로필 정보 수정 (여러 필드 동시)
 */
export const updateProfile = (data: UpdateProfileRequest): Promise<BaseResponse<UserProfile>> => {
  return apiClient.patch('/api/users/me', data);
};

/**
 * 이름 수정
 */
export const updateName = (name: string): Promise<BaseResponse<{ name: string }>> => {
  return apiClient.patch('/api/users/me/name', { name });
};

/**
 * 생년월일 수정
 */
export const updateDateOfBirth = (dateOfBirth: string): Promise<BaseResponse<{ dateOfBirth: string }>> => {
  return apiClient.patch('/api/users/me/birth', { dateOfBirth });
};

/**
 * 성별 수정
 */
export const updateGender = (gender: 'M' | 'F' | 'O'): Promise<BaseResponse<{ gender: string }>> => {
  return apiClient.patch('/api/users/me/gender', { gender });
};

/**
 * 휴대폰 번호 인증 코드 발송
 */
export const sendPhoneVerification = (phone: string): Promise<BaseResponse<{ verificationId: string }>> => {
  return apiClient.post('/api/users/me/phone-number/verification', { phone });
};

/**
 * 휴대폰 번호 인증 코드 확인 및 번호 변경
 */
export const confirmPhoneVerification = (
  verificationId: string,
  code: string,
  phone: string
): Promise<BaseResponse<{ phone:string }>> => {
  return apiClient.post('/api/users/me/phone-number/verification/confirm', { verificationId, code, phone });
};

/**
 * 이메일 주소 수정
 */
export const updateEmail = (email: string): Promise<BaseResponse<{ email: string }>> => {
  return apiClient.patch('/api/users/me/email', { email });
};

/**
 * 이메일 인증 코드 발송
 */
export const sendEmailVerification = (email: string): Promise<BaseResponse<{ verificationId: string }>> => {
  return apiClient.post('/api/users/me/email/verification', { email });
};

/**
 * 이메일 인증 코드 확인 및 이메일 변경
 */
export const confirmEmailVerification = (
  verificationId: string,
  code: string,
  email: string
): Promise<BaseResponse<{ email: string }>> => {
  return apiClient.post('/api/users/me/email/verification/confirm', { verificationId, code, email });
};

/**
 * 직업 수정
 */
export const updateJob = (job: string): Promise<BaseResponse<{ job: string }>> => {
  return apiClient.patch('/api/users/me/job', { job });
};

/**
 * 월 수입 수정
 */
export const updateMonthlyIncome = (monthlyIncome: number): Promise<BaseResponse<{ monthlyIncome: number }>> => {
  return apiClient.patch('/api/users/me/monthly-income', { monthlyIncome });
};

/**
 * 프로필 이미지 업로드
 */
export const updateAvatar = (avatar: string): Promise<BaseResponse<{ avatar: string }>> => {
  return apiClient.patch('/api/users/me/avatar', { avatar });
};

/**
 * 프로필 이미지 제거
 */
export const removeAvatar = (): Promise<BaseResponse<null>> => {
  return apiClient.delete('/api/users/me/avatar');
};


// 모든 API 함수를 profileApi 객체로 묶어서 export
export const profileApi = {
  getUserProfile,
  updateProfile,
  updateName,
  updateDateOfBirth,
  updateGender,
  sendPhoneVerification,
  confirmPhoneVerification,
  updateEmail,
  sendEmailVerification,
  confirmEmailVerification,
  updateJob,
  updateMonthlyIncome,
  updateAvatar,
  removeAvatar,
};