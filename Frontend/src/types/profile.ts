/**
 * Profile/User 관련 타입 정의
 */

/**
 * 사용자 프로필 정보 (API 응답 형태 - API 명세 기준)
 */
export interface UserProfile {
  id: number;
  uuid: string;
  name: string;
  phoneNumber: string;
  gender: string; // 'MAN', 'WOMAN', etc.
  birthDate: string; // YYYY-MM-DD 형식
  baseDay: number; // 1-28
  job: string;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
  email?: string | null;
  monthlyIncome?: number | null; // 원 단위
}

/**
 * 사용자 프로필 응답 DTO (API 명세 기준)
 */
export interface MeResponseDto {
  success: boolean;
  message: string | null;
  data: UserProfile;
}

/**
 * 프로필 수정 요청 DTO (API 명세 기준)
 */
export interface MePatchRequestDto {
  name?: string;
  birthDate?: string; // date format (YYYY-MM-DD)
  gender?: string;
  phoneNumber?: string;
  email?: string;
  job?: string;
  baseDay?: number; // 1-28
  monthlyIncome?: number;
  phoneVerificationToken?: string;
  emailVerificationToken?: string;
}

/**
 * 프로필 수정 요청 (레거시 호환성)
 */
export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  job?: string;
  monthlyIncome?: number;
  avatar?: string; // base64 이미지 또는 파일 URL
  baseDay?: number; // 기준일 (1-31)
  
  // 레거시 필드들 (기존 코드 호환성을 위해 유지)
  phone?: string;
  gender?: 'M' | 'F' | 'O' | 'unknown';
  dateOfBirth?: string;
}

/**
 * 로컬 저장소용 사용자 정보 (간소화)
 * UserProfile에서 민감 정보 제외
 */
export interface LocalUser {
  // 백엔드에서 전달되는 고유 사용자 ID
  userId?: number;
  userName: string;
  isPushEnabled: boolean;
  deviceId?: string; // 디바이스 ID (옵션)
  accessToken?: string; // 액세스 토큰 (옵션)
}