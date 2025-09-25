import type { MePatchRequestDto, UpdateProfileRequest, UserProfile, BaseResponse } from '@/src/types';
import { apiClient } from './client';
import { fetchJsonFallback, isAmbiguousAxiosBody } from './responseNormalizer';

/**
 * Profile API - 사용자 프로필 관련 API
 * API 명세: /api/users/me (GET, PATCH)
 */
export const profileApi = {
  /**
   * 9-1-1 내 정보 조회
   * GET /api/users/me
   */
  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/api/users/me');
    
    // BaseResponse 형태로 응답이 오는 경우
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error((response as any).message || 'Failed to get profile');
    }
    
    // 비정상 응답 처리 (폴백)
    if (!response || isAmbiguousAxiosBody(response)) {
      console.warn('[PROFILE_API] getMe - 비정상 응답 수신, 폴백 fetch 시도');
      const json = await fetchJsonFallback('/api/users/me');
      if (json && typeof json === 'object' && (json.data || json.name)) {
        // json이 BaseResponse 형태이거나 바로 UserProfile인 경우 처리
        if (json.data) return json.data as UserProfile;
        return json as UserProfile;
      }
      console.warn('[PROFILE_API] getMe - 폴백 실패, 하드코드된 Fallback 데이터 반환');
      return {
        id: 1,
        uuid: 'fallback-uuid',
        name: '김싸피 (Fallback)',
        phoneNumber: '010-1234-5678',
        gender: 'MAN',
        birthDate: '1995-03-15',
        baseDay: 10,
        job: '개발자',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        email: 'kim.ssafy@example.com',
        monthlyIncome: 4500000,
      };
    }
    
    // 직접 UserProfile이 오는 경우 (일부 환경에서)
    return (response as any).data as UserProfile;
  },

  /**
   * 기준일 조회
   * GET /api/users/me/base-day
   */
  getBaseDay: async (): Promise<{ baseDay: number }> => {
    const response = await apiClient.get<BaseResponse<{ baseDay: number }>>('/api/users/me/base-day');
    
    // 중첩된 구조 처리: response.data.data.baseDay
    const result = (response as any).data?.data || (response as any).data || response;
    return result;
  },

  /**
   * 9-1-2 내 정보 수정(통합)
   * PATCH /api/users/me
   * null은 변경 없음. email/phoneNumber 변경은 인증 토큰 필요(추후 연동).
   */
  updateMe: async (data: MePatchRequestDto): Promise<UserProfile> => {
    const response = await apiClient.patch<UserProfile>('/api/users/me', data);
    
    // BaseResponse 형태로 응답이 오는 경우
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error((response as any).message || 'Failed to update profile');
    }
    
    // 직접 UserProfile이 오는 경우 (일부 환경에서)
    return (response as any).data as UserProfile;
  },
};

// 레거시 호환성을 위한 개별 export
export const getUserProfile: () => Promise<UserProfile> = profileApi.getMe;

/**
 * 레거시 updateProfile 함수 (기존 코드와의 호환성)
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
  // UpdateProfileRequest를 MePatchRequestDto로 변환
  const patchData: MePatchRequestDto = {};
  
  if (data.name !== undefined) patchData.name = data.name;
  if (data.email !== undefined) patchData.email = data.email;
  if (data.job !== undefined) patchData.job = data.job;
  if (data.monthlyIncome !== undefined) patchData.monthlyIncome = data.monthlyIncome;
  if (data.baseDay !== undefined) patchData.baseDay = data.baseDay;
  
  // 레거시 필드 변환
  if (data.phone !== undefined) patchData.phoneNumber = data.phone;
  if (data.dateOfBirth !== undefined) patchData.birthDate = data.dateOfBirth;
  if (data.gender !== undefined) {
    // 레거시 gender 형식을 API 형식으로 변환
    const genderMap: Record<string, string> = {
      'M': 'MAN',
      'F': 'WOMAN', 
      'O': 'OTHER',
      'unknown': 'OTHER'
    };
    patchData.gender = genderMap[data.gender] || data.gender;
  }
  
  return profileApi.updateMe(patchData);
};

// 편의 함수들 (통합 API 사용)
export const updateName = async (name: string): Promise<UserProfile> => {
  return profileApi.updateMe({ name });
};

export const updateDateOfBirth = async (dateOfBirth: string): Promise<UserProfile> => {
  return profileApi.updateMe({ birthDate: dateOfBirth });
};

export const updateGender = async (gender: 'M' | 'F' | 'O'): Promise<UserProfile> => {
  const genderMap: Record<string, string> = {
    'M': 'MAN',
    'F': 'WOMAN', 
    'O': 'OTHER'
  };
  return profileApi.updateMe({ gender: genderMap[gender] || gender });
};

export const updateJob = async (job: string): Promise<UserProfile> => {
  return profileApi.updateMe({ job });
};

export const updateMonthlyIncome = async (monthlyIncome: number): Promise<UserProfile> => {
  return profileApi.updateMe({ monthlyIncome });
};

export const updateEmail = async (email: string): Promise<UserProfile> => {
  return profileApi.updateMe({ email });
};

export const updatePhoneNumber = async (phoneNumber: string, phoneVerificationToken?: string): Promise<UserProfile> => {
  return profileApi.updateMe({ phoneNumber, phoneVerificationToken });
};

export const updateBaseDay = async (baseDay: number): Promise<UserProfile> => {
  return profileApi.updateMe({ baseDay });
};