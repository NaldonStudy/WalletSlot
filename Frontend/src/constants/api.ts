// ===== API 관련 상수 =====
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
} as const;

// MSW 사용 여부 결정
export const USE_MSW = __DEV__; // 개발 환경에서 MSW 사용

// 백엔드 사용 가능 여부 (MSW 사용 시 false)
export const BACKEND_AVAILABLE = (() => {
  // MSW를 사용하는 경우 실제 백엔드는 사용하지 않음
  if (USE_MSW) return false;
  
  const url = API_CONFIG.BASE_URL || '';
  // 기본값이 localhost이면 외부에서 접근 가능한 백엔드가 아닐 수 있으므로 false로 취급
  if (url.includes('localhost') || url.includes('127.0.0.1')) return false;
  return true;
})();
