// ===== API 관련 상수 =====
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://j13b108.p.ssafy.io',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
} as const;

// MSW 사용 여부 결정
export const USE_MSW = __DEV__; // 개발 환경에서 MSW 사용
// export const USE_MSW = false; // MSW 비활성화 - 실제 API 사용

// 백엔드 사용 가능 여부 (MSW 사용 시 false)
export const BACKEND_AVAILABLE = (() => {
  // MSW를 사용하는 경우 실제 백엔드는 사용하지 않음
  if (USE_MSW) return false;
  
  const url = API_CONFIG.BASE_URL || '';
  // 기본값이 localhost이면 외부에서 접근 가능한 백엔드가 아닐 수 있으므로 false로 취급
  if (url.includes('localhost') || url.includes('127.0.0.1')) return false;
  return true;
})();

// 알림 목록 axios 모호 응답 시 fetch fallback 사용 여부 (원인 해결 후 false 권장)
export const ENABLE_NOTIFICATION_FALLBACK = (process.env.EXPO_PUBLIC_ENABLE_NOTIFICATION_FALLBACK ?? 'true') === 'true';

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  // Device Management
  DEVICES: '/api/devices',
  DEVICE_BY_ID: (deviceId: string) => `/api/devices/${deviceId}`,
  DEVICE_TOKEN: (deviceId: string) => `/api/devices/${deviceId}/token`,
  
  // Push Endpoints
  PUSH_ENDPOINTS: '/api/push/endpoints',
  PUSH_ENDPOINT_BY_ID: (deviceId: string) => `/api/push/endpoints/${deviceId}`,
  
  // Auth
  PIN_CHANGE: '/api/auth/pin',
  
  // Accounts
  ACCOUNTS_LINK: '/api/accounts/link',
  ACCOUNT_BY_ID: (accountId: string) => `/api/accounts/${accountId}`,
  
  // User Profile
  USER_ME: '/api/users/me',
} as const;
