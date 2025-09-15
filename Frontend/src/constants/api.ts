// ===== API 관련 상수 =====
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
} as const;

// 작은 헬퍼: 개발 중 백엔드 미구동 시 일부 API 호출을 건너뛰기 위한 플래그
export const BACKEND_AVAILABLE = (() => {
  const url = API_CONFIG.BASE_URL || '';
  // 기본값이 localhost이면 외부에서 접근 가능한 백엔드가 아닐 수 있으므로 false로 취급
  if (url.includes('localhost') || url.includes('127.0.0.1')) return false;
  return true;
})();
