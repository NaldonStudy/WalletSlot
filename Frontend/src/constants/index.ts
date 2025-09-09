// ===== API 관련 상수 =====
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
} as const;

// ===== 앱 설정 상수 =====
export const APP_CONFIG = {
  NAME: 'WalletSlot',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@walletslot.com',
} as const;

// ===== 슬롯 카테고리 관련 상수 =====
export const SLOT_CATEGORIES = {
  FOOD: { label: '식비', emoji: '🍽️', color: '#FF6B6B' },
  TRANSPORT: { label: '교통', emoji: '🚗', color: '#4ECDC4' },
  SHOPPING: { label: '쇼핑', emoji: '🛍️', color: '#45B7D1' },
  ENTERTAINMENT: { label: '엔터테인먼트', emoji: '🎮', color: '#96CEB4' },
  EDUCATION: { label: '교육', emoji: '📚', color: '#FFEAA7' },
  HEALTHCARE: { label: '의료', emoji: '🏥', color: '#DDA0DD' },
  SAVINGS: { label: '저축', emoji: '💰', color: '#98D8C8' },
  UNCATEGORIZED: { label: '미분류', emoji: '❓', color: '#95A5A6' },
  OTHER: { label: '기타', emoji: '📦', color: '#B0B0B0' },
} as const;

// ===== 소득 구간 관련 상수 =====
export const INCOME_LEVELS = {
  UNDER_100: { label: '100만원 이하', min: 0, max: 100 },
  '100_200': { label: '100만원 - 200만원', min: 100, max: 200 },
  '200_300': { label: '200만원 - 300만원', min: 200, max: 300 },
  '300_400': { label: '300만원 - 400만원', min: 300, max: 400 },
  '400_500': { label: '400만원 - 500만원', min: 400, max: 500 },
  OVER_500: { label: '500만원 이상', min: 500, max: Infinity },
} as const;

// ===== 은행 코드 상수 =====
export const BANK_CODES = {
  '001': { name: '한국은행', shortName: '한은' },
  '002': { name: '산업은행', shortName: '산업' },
  '003': { name: '기업은행', shortName: '기업' },
  '004': { name: '국민은행', shortName: '국민' },
  '007': { name: '수협중앙회', shortName: '수협' },
  '008': { name: '수출입은행', shortName: '수출입' },
  '011': { name: '농협은행', shortName: '농협' },
  '012': { name: '지역농축협', shortName: '지역농축협' },
  '020': { name: '우리은행', shortName: '우리' },
  '023': { name: 'SC제일은행', shortName: 'SC제일' },
  '027': { name: '한국씨티은행', shortName: '씨티' },
  '031': { name: '대구은행', shortName: '대구' },
  '032': { name: '부산은행', shortName: '부산' },
  '034': { name: '광주은행', shortName: '광주' },
  '035': { name: '제주은행', shortName: '제주' },
  '037': { name: '전북은행', shortName: '전북' },
  '039': { name: '경남은행', shortName: '경남' },
  '045': { name: '새마을금고', shortName: '새마을' },
  '048': { name: '신협', shortName: '신협' },
  '050': { name: '상호저축은행', shortName: '상호저축' },
  '054': { name: '홍콩상하이은행', shortName: 'HSBC' },
  '055': { name: '도이치은행', shortName: '도이치' },
  '057': { name: '제이피모간체이스은행', shortName: 'JP모간' },
  '058': { name: '미즈호은행', shortName: '미즈호' },
  '060': { name: 'BOA은행', shortName: 'BOA' },
  '081': { name: 'KEB하나은행', shortName: '하나' },
  '088': { name: '신한은행', shortName: '신한' },
  '089': { name: '케이뱅크', shortName: '케이뱅크' },
  '090': { name: '카카오뱅크', shortName: '카카오뱅크' },
  '092': { name: '토스뱅크', shortName: '토스뱅크' },
} as const;

// ===== 정규식 패턴 =====
export const REGEX_PATTERNS = {
  PHONE: /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/,
  BIRTH_DATE: /^[0-9]{6}$/, // YYMMDD 형식
  ACCOUNT_NUMBER: /^[0-9]{10,14}$/,
  PASSWORD: /^[0-9]{6}$/, // PIN 6자리 숫자
  NAME: /^[가-힣a-zA-Z\s-]{2,20}$/, // 한글, 영문, 공백, 하이픈 허용
  VERIFICATION_CODE: /^[0-9]{6}$/, // 인증번호 6자리
  ACCOUNT_VERIFICATION_CODE: /^[0-9]{3}$/, // 계좌 인증 3자리 코드
} as const;

// ===== 에러 메시지 =====
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  INVALID_PHONE: '올바른 휴대폰 번호를 입력해주세요.',
  INVALID_BIRTH_DATE: '주민등록번호 앞 6자리를 입력해주세요.',
  INVALID_ACCOUNT: '올바른 계좌번호를 입력해주세요.',
  INVALID_PASSWORD: '6자리 숫자를 입력해주세요.',
  INVALID_NAME: '2-20자의 이름을 입력해주세요. (한글, 영문, 공백, 하이픈 가능)',
  INVALID_VERIFICATION_CODE: '6자리 인증번호를 입력해주세요.',
  INVALID_ACCOUNT_VERIFICATION_CODE: '3자리 계좌 인증번호를 입력해주세요.',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
  LOGIN_FAILED: '로그인에 실패했습니다.',
  BUDGET_EXCEEDED: '예산을 초과했습니다.',
  REQUIRED_FIELD: '필수 입력 항목입니다.',
  PHONE_VERIFICATION_FAILED: '휴대폰 인증에 실패했습니다.',
  ACCOUNT_VERIFICATION_FAILED: '계좌 인증에 실패했습니다.',
  INSUFFICIENT_SAVINGS: '지난달 절약금액 이상으로 예산을 늘릴 수 없어요.',
} as const;

// ===== 화면 크기 관련 상수 =====
export const SCREEN_SIZES = {
  SMALL: 375,
  MEDIUM: 414,
  LARGE: 768,
} as const;

// ===== 애니메이션 상수 =====
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;

// ===== 로컬 스토리지 키 =====
export const STORAGE_KEYS = {
  AUTH_TOKENS: 'auth_tokens',
  DEVICE_INFO: 'device_info',
  USER_PREFERENCES: 'user_preferences',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;

// ===== 테마 관련 상수 재내보내기 =====
export * from './theme';
