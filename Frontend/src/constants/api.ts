// ===== API 관련 상수 =====
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
} as const;
