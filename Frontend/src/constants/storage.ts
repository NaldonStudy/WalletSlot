// ===== 로컬 스토리지 키 =====
export const STORAGE_KEYS = {
  // 인증 관련
  USER: 'local_user',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  NOTIFICATION_CONSENT: 'notification_consent',
  
  // 앱 설정
  ONBOARDING_DONE: 'onboarding_done',
  DEVICE_ID: 'device_id',
  
  // 기타 설정 (향후 사용 예정)
  USER_PREFERENCES: 'user_preferences',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;
