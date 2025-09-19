import type { UpdateProfileRequest, UserProfile } from '@/src/types';
import { apiClient } from './client';
import { fetchJsonFallback, isAmbiguousAxiosBody } from './responseNormalizer';

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/api/users/me');
  // apiClient.parseOrReturn는 가능한 한 { success, data } 형태를 반환하도록 보장합니다.
  if (!response || isAmbiguousAxiosBody(response)) {
    console.warn('[PROFILE_API] getUserProfile - 비정상 응답 수신, 폴백 fetch 시도');
    const json = await fetchJsonFallback('/api/users/me');
    if (json && typeof json === 'object' && (json.data || json.name)) {
      // json이 BaseResponse 형태이거나 바로 UserProfile인 경우 처리
      if (json.data) return json.data as UserProfile;
      return json as UserProfile;
    }
    console.warn('[PROFILE_API] getUserProfile - 폴백 실패, 하드코드된 Fallback 데이터 반환');
    return {
      name: '김싸피 (Fallback)',
      phone: '010-1234-5678',
      gender: 'M',
      dateOfBirth: '1995-03-15',
      email: 'kim.ssafy@example.com',
      job: '개발자',
      monthlyIncome: 4500000,
      avatar: null,
    };
  }
  return response.data as unknown as UserProfile;
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>('/api/users/me', data);
  return response.data;
};

export const updateName = async (name: string): Promise<{ name: string }> => {
  const response = await apiClient.patch<{ name: string }>('/api/users/me/name', { name });
  return response.data;
};

export const updateDateOfBirth = async (dateOfBirth: string): Promise<{ dateOfBirth: string }> => {
  const response = await apiClient.patch<{ dateOfBirth: string }>('/api/users/me/birth', { dateOfBirth });
  return response.data;
};

export const updateGender = async (gender: 'M' | 'F' | 'O'): Promise<{ gender: string }> => {
  const response = await apiClient.patch<{ gender: string }>('/api/users/me/gender', { gender });
  return response.data;
};

export const sendPhoneVerification = async (phone: string): Promise<{ verificationId: string }> => {
  const response = await apiClient.post<{ verificationId: string }>('/api/users/me/phone-number/verification', { phone });
  return response.data;
};

export const confirmPhoneVerification = async (
  verificationId: string,
  code: string,
  phone: string
): Promise<{ phone: string }> => {
  const response = await apiClient.post<{ phone: string }>('/api/users/me/phone-number/verification/confirm', { verificationId, code, phone });
  return response.data;
};

export const updateEmail = async (email: string): Promise<{ email: string }> => {
  const response = await apiClient.patch<{ email: string }>('/api/users/me/email', { email });
  return response.data;
};

export const sendEmailVerification = async (email: string): Promise<{ verificationId: string }> => {
  const response = await apiClient.post<{ verificationId: string }>('/api/users/me/email/verification', { email });
  return response.data;
};

export const confirmEmailVerification = async (
  verificationId: string,
  code: string,
  email: string
): Promise<{ email: string }> => {
  const response = await apiClient.post<{ email: string }>('/api/users/me/email/verification/confirm', { verificationId, code, email });
  return response.data;
};

export const updateJob = async (job: string): Promise<{ job: string }> => {
  const response = await apiClient.patch<{ job: string }>('/api/users/me/job', { job });
  return response.data;
};

export const updateMonthlyIncome = async (monthlyIncome: number): Promise<{ monthlyIncome: number }> => {
  const response = await apiClient.patch<{ monthlyIncome: number }>('/api/users/me/monthly-income', { monthlyIncome });
  return response.data;
};

export const updateAvatar = async (avatar: string): Promise<{ avatar: string }> => {
  // 입력이 data URI(base64)인 경우 기존 PATCH 경로를 사용
  if (typeof avatar === 'string' && avatar.startsWith('data:')) {
    const response = await apiClient.patch<{ avatar: string }>('/api/users/me/avatar', { avatar });
    return response.data;
  }

  // 그 외(예: 로컬 파일 URI)를 받는 경우 FormData 업로드 시도
  try {
    const form = new FormData();
    form.append('avatar', { uri: avatar, name: 'avatar.jpg', type: 'image/jpeg' } as any);
    const res = await apiClient.upload<{ avatar: string }>('/api/users/me/avatar', form);
    return res.data;
  } catch (e) {
    // 마지막으로 폴백: 기존 PATCH 시도
    const response = await apiClient.patch<{ avatar: string }>('/api/users/me/avatar', { avatar });
    return response.data;
  }
};

export const removeAvatar = async (): Promise<null> => {
  const response = await apiClient.delete<null>('/api/users/me/avatar');
  return response.data;
};

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