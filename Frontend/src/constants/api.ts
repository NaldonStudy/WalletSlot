// ===== API 관련 상수 =====
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://j13b108.p.ssafy.io',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
} as const;

// MSW 사용 여부 결정
export const USE_MSW = false; // MSW 비활성화 (실제 API 사용)

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
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_BY_ID: (id: string) => `/api/notifications/${id}`,
  NOTIFICATIONS_PULL: '/api/notifications/pull',
  NOTIFICATIONS_READ_ALL: '/api/notifications/read-all',
  NOTIFICATIONS_UNREAD_COUNT: '/api/notifications/unread-count',
  // Notification settings (client and MSW use this path; server may choose a different one)
  NOTIFICATIONS_SETTINGS: '/api/notifications/settings',
  
  // Auth
  PIN_CHANGE: '/api/auth/pin',
  // PIN verify helper used by MSW test handlers
  PIN_VERIFY: '/api/auth/pin/verify',
  PIN_RESET_REQUEST: '/api/auth/pin/reset/request',
  PIN_RESET_CONFIRM: '/api/auth/pin/reset/confirm',
  AUTH_LOGIN_FULL: '/api/auth/login/full',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_SMS_SEND: '/api/auth/sms/send',
  AUTH_SMS_VERIFY: '/api/auth/sms/verify',
  AUTH_SMS_VERIFY_SIGNUP: '/api/auth/sms/verify-signup',
  AUTH_PASSWORD_RESET: '/api/auth/password/reset',
  AUTH_PASSWORD_RESET_REQUEST: '/api/auth/password/reset-request',
  
  // Accounts
  ACCOUNTS_LINK: '/api/accounts/link',
  ACCOUNT_BY_ID: (accountId: string) => `/api/accounts/${accountId}`,
  ACCOUNTS: '/api/accounts',
  ACCOUNTS_PRIMARY: '/api/accounts/primary',
  ACCOUNT_BALANCE: (accountId: string) => `/api/accounts/${accountId}/balance`,
  ACCOUNT_SLOTS: (accountId: string) => `/api/accounts/${accountId}/slots`,
  ACCOUNT_SLOT_TRANSACTIONS: (accountId: string, slotId: string) => `/api/accounts/${accountId}/slots/${slotId}/transactions`,
  ACCOUNT_SLOT_DAILY_SPENDING: (accountId: string, accountSlotId: string) => `/api/accounts/${accountId}/slots/${accountSlotId}/transactions/daily-spending`,
  ACCOUNT_SLOT_HISTORY: (accountId: string, slotId: string) => `/api/accounts/${accountId}/slots/${slotId}/history`,
  ACCOUNT_TRANSACTION_HISTORY_CHECK: (accountId: string) => `/api/accounts/${accountId}/transactions/history/check`,
  ACCOUNT_SLOT_RECOMMEND: (accountId: string) => `/api/accounts/${accountId}/slots/recommend`,
  ACCOUNT_SLOT_RECOMMEND_BY_PROFILE: (accountId: string) => `/api/accounts/${accountId}/slots/recommend/by-profile`,
  ACCOUNTS_VERIFICATION_REQUEST: '/api/accounts/verification/request',
  ACCOUNTS_VERIFICATION_VERIFY: '/api/accounts/verification/verify',

  // MyData Consents
  MYDATA_CONSENTS: '/api/mydata/consents',
  MYDATA_INSTITUTIONS: '/api/mydata/institutions',
  MYDATA_CONSENTS_REVOKE: '/api/mydata/consents/revoke',
  MYDATA_CONSENTS_RENEW: '/api/mydata/consents/renew',
  
  // Reports
  // NOTE: legacy `/api/reports/spending` removed — use AI report endpoints under /api/accounts/{accountId}/ai-reports
  // AI 기반 소비 레포트
  AI_REPORTS_BASE: (accountId: string) => `/api/accounts/${accountId}/ai-reports`,
  AI_REPORTS_MONTHS: (accountId: string) => `/api/accounts/${accountId}/ai-reports/months`,
  AI_REPORTS_ARCHIVE: (accountId: string) => `/api/accounts/${accountId}/ai-reports/archive`,
  
  // User Profile
  USER_ME: '/api/users/me',
  USER_ME_BASE_DAY: '/api/users/me/base-day',
  
  // Slots
  SLOTS: '/api/slots',
  SLOT_BY_ID: (slotId: string) => `/api/slots/${slotId}`,
} as const;
