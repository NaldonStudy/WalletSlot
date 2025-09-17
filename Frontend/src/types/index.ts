// ===== 공통 타입 =====

// ===== UI 컴포넌트용 타입들 =====

/**
 * 슬롯 데이터 (원형 그래프용)
 */
export interface SlotData {
  slotId: string;
  name: string;
  budget: number;
  remain: number;
  color: string;
}

/**
 * 계좌 데이터 (슬롯 포함)
 */
export interface AccountData {
  bankCode: string;
  accountName: string;
  accountNumber: string;
  balanceFormatted: string;
  slots: SlotData[];
}

export interface BaseResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * API 응답을 위한 제네릭 인터페이스입니다.
 * @template T - 응답 데이터의 타입을 나타냅니다.
 * @deprecated BaseResponse를 사용하세요
 */
export interface APIResponse<T> {
  status: 'success' | 'error';
  data: T | null;
  message: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  meta: PaginationMeta;
}

// ===== 사용자 관련 타입 =====
/**
 * 사용자 정보 인터페이스 (users 테이블)
 */
export interface User {
  userId: number;
  name: string;
  phone: string;
  gender: 'M' | 'F' | 'O' | 'unknown'; // enum 타입 반영
  dateOfBirth: string; // date -> string
  email: string | null;
  createdAt: string; // create_at -> createdAt, datetime -> string
  updatedAt: string; // update_at -> updatedAt, datetime -> string
}

/**
 * 은행 정보 인터페이스 (banks 테이블)
 */
export interface Bank {
  bankCode: string;
  bankName: string;
  displayLabel: string | null;
  logoKey: string;
  brandColor: string | null;
}

/**
 * 사용자 계좌 정보 인터페이스 (accounts 테이블)
 */
export interface UserAccount {
  accountId: number;
  userId: number;
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumberMasked: string | null;
  balanceMinor: number;
  lastSyncedAt: string | null;
  isPrimary: boolean; // tinyint(1) -> boolean
}

/**
 * 슬롯(통장 쪼개기) 정보 인터페이스 (slots 테이블)
 */
export interface Slot {
  slotId: number;
  accountId: number;
  name: string;
  targetMinorFirst: number;
  targetMinor: number;
  currentBalanceMinor: number;
  period: 'weekly' | 'monthly' | 'yearly' | 'oneoff';
  periodAnchorDay: number | null;
  changeCount: number;
  rollover: 'none' | 'carryover' | 'cap_to_target';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 슬롯 카테고리 정보 인터페이스
 */
export interface SlotCategory {
  categoryId: number;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  sortOrder: number;
}

/**
 * 슬롯 히스토리/변경 이력 인터페이스
 */
export interface SlotHistory {
  historyId: number;
  slotId: number;
  action: 'created' | 'budget_updated' | 'info_updated' | 'deleted' | 'period_reset';
  oldValue: any;
  newValue: any;
  reason?: string;
  changedAt: string;
  changedBy: number; // userId
}

// ===== API 요청/응답 타입들 =====

/**
 * 새 슬롯 생성 요청
 */
export interface CreateSlotRequest {
  accountId: number;
  categoryId: number;
  name: string;
  targetMinor: number;
  period: 'weekly' | 'monthly' | 'yearly' | 'oneoff';
  periodAnchorDay?: number;
  rollover?: 'none' | 'carryover' | 'cap_to_target';
}

/**
 * 슬롯 예산 수정 요청
 */
export interface UpdateSlotBudgetRequest {
  slotId: number;
  newBudget: number;
  reason: string;
}

/**
 * 푸시 알림 엔드포인트 정보 인터페이스 (push_endpoint 테이블)
 * UserDevice와 유사한 역할을 합니다.
 */
export interface PushEndpoint {
  pushTokenId: string;
  userId: number | null;
  deviceId: string;
  token: string;
  tokenHash: string;
  status:
    | 'ACTIVE'
    | 'LOGGED_OUT'
    | 'ACCOUNT_LOCKED'
    | 'USER_WITHDRAW'
    | 'OPTED_OUT';
}

// =================================================================
// 아래는 ERD에 명시되었으나 프론트엔드에서 직접 사용할 가능성이 낮은 타입들입니다.
// 완전한 타입 정의를 위해 포함되었습니다.
// =================================================================

/**
 * 사용자 PIN 자격 증명 정보 (user_pin_credentials 테이블)
 * 프론트엔드에서는 이 정보를 직접 다루지 않습니다.
 */
export interface UserPinCredential {
  key: number;
  userId: number;
  pinBcrypt: string;
  pepperId: number;
  cost: number;
  failedAttempts: number;
  lockedUntil: string | null;
  lastChangedAt: string;
  lastVerifiedAt: string | null;
}

/**
 * Pepper 키 정보 (pepper_keys 테이블)
 * 서버 측 보안 관련 정보입니다.
 */
export interface PepperKey {
  pepperId: number;
  keyAlias: string;
  status: 'activate' | 'rotated' | 'retired';
  createdAt: string;
  rotatedAt: string | null;
}

/**
 * 마이데이터 세션 정보 (mydata_sessions 테이블)
 */
export interface MyDataSession {
  sessionId: number;
  userId: number;
  consentedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
}

/**
 * SSAFY 교육용 데이터 (ssafydata 테이블)
 */
export interface SsafyData {
  dataId: number;
  name: string;
  email: string;
}

// ===== 인증 관련 타입들 =====

/**
 * 사용자 기기 정보 인터페이스
 */
export interface UserDevice {
  deviceId: string;
  userId: number;
  deviceType: 'ios' | 'android';
  fcmToken: string | null;
  platform: string;
  lastLoginAt: string;
  createdAt: string;
}

/**
 * 인증 토큰 정보
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * 로그인 폼 데이터
 */
export interface LoginForm {
  phone: string;
  password: string;
}

/**
 * 회원가입 폼 데이터
 */
export interface RegisterForm {
  name: string;
  phone: string;
  gender: 'M' | 'F' | 'O';
  dateOfBirth: string;
  email?: string;
}

/**
 * 휴대폰 인증 폼 데이터
 */
export interface PhoneVerificationForm {
  phone: string;
  verificationCode: string;
}

/**
 * 계좌 인증 폼 데이터
 */
export interface AccountVerificationForm {
  accountNumber: string;
  bankCode: string;
  verificationCode: string; // 예금주명에 포함된 3자리 숫자 (예: "국민073" → "073")
}

/**
 * 비밀번호 설정/변경 폼 데이터
 */
export interface PasswordForm {
  password: string;
  confirmPassword: string;
}

// ===== 거래 관련 타입들 =====

/**
 * 거래 내역 정보 인터페이스
 */
export interface Transaction {
  transactionId: number;
  accountId: number;
  slotId: number | null;
  categoryId: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  transactionDate: string;
  createdAt: string;
}

/**
 * 거래 카테고리 정보 인터페이스
 */
export interface TransactionCategory {
  categoryId: number;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  isDefault: boolean;
  sortOrder: number;
}

// ===== 푸시 알림 관련 타입들 =====

/**
 * 알림 항목 인터페이스
 */
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'budget_exceeded' | 'goal_achieved' | 'spending_pattern' | 'system' | 'account_sync';
  isRead: boolean;
  createdAt: string;
  slotId?: number;
  accountId?: number;
  pushData?: {
    action?: string;        // 알림 클릭 시 액션
    targetScreen?: string;  // 이동할 화면
    params?: any;          // 추가 데이터
  };
}

// ===== 푸시 알림 관련 =====
/**
 * 최초 토큰 등록 요청 (알림 권한 허용시)
 */
export interface InitialTokenRequest {
  token: string;     // FCM/APNS 푸시 토큰
  platform: 'ios' | 'android';  // 플랫폼 정보
}

/**
 * 최초 토큰 등록 응답
 */
export interface InitialTokenResponse extends BaseResponse {
  deviceId: string;  // 서버에서 생성한 디바이스 고유 식별자
}

/**
 * 토큰 갱신 요청 (앱 실행시 토큰이 변경된 경우)
 */
export interface UpdateTokenRequest {
  token: string;     // 새로운 FCM/APNS 푸시 토큰
  deviceId: string;  // 기존에 등록된 디바이스 ID
}



/**
 * 푸시 알림 설정
 */
export interface NotificationSettings {
  pushEnabled: boolean;
  budgetAlertsEnabled: boolean;
  goalAlertsEnabled: boolean;
  spendingPatternEnabled: boolean;
  systemAlertsEnabled: boolean;
}

/**
 * 푸시 알림 전송 요청 (테스트용)
 */
export interface SendNotificationRequest {
  userIds?: number[];
  title: string;
  message: string;
  type: NotificationItem['type'];
  data?: any;
}

// ===== Firebase 푸시 알림 관련 =====

/**
 * FCM 토큰 등록 요청
 */
export interface FCMTokenRequest {
  fcmToken: string;
  deviceId: string;
  platform: 'ios' | 'android';
  appVersion: string;
  osVersion: string;
  apnsToken?: string; // iOS APNs 토큰 (옵션)
}

/**
 * FCM 푸시 알림 페이로드
 */
export interface FCMPushPayload {
  notification: {
    title: string;
    body: string;
    icon?: string;
    sound?: string;
    badge?: string;
  };
  data: {
    notificationId: string;
    type: NotificationItem['type'];
    action?: string;
    targetScreen?: string;
    slotId?: string;
    accountId?: string;
    [key: string]: string | undefined;
  };
  android?: {
    priority: 'high' | 'normal';
    notification: {
      channel_id: string;
      color?: string;
      sound?: string;
    };
  };
  apns?: {
    payload: {
      aps: {
        alert: {
          title: string;
          body: string;
          subtitle?: string;
        };
        sound: string;
        badge?: number;
        'content-available'?: 1; // 백그라운드 업데이트용
        'mutable-content'?: 1; // 미디어 첨부 지원
        category?: string; // 알림 카테고리
      };
      customData?: {
        [key: string]: any;
      };
    };
    headers?: {
      'apns-priority'?: '5' | '10';
      'apns-expiration'?: string;
      'apns-topic'?: string;
    };
  };
}

/**
 * Firebase Admin SDK를 통한 알림 전송 요청
 */
export interface FirebasePushRequest {
  tokens: string[];  // FCM 토큰 배열 (멀티캐스트)
  payload: FCMPushPayload;
  options?: {
    priority?: 'high' | 'normal';
    timeToLive?: number;
    collapseKey?: string;
  };
}

/**
 * iOS 전용 푸시 알림 옵션
 */
export interface IOSNotificationOptions {
  sound?: 'default' | string | null;
  badge?: number;
  subtitle?: string;
  categoryIdentifier?: string;
  launchImageName?: string;
  threadIdentifier?: string;
  targetContentIdentifier?: string;
}

/**
 * 플랫폼별 푸시 알림 설정
 */
export interface PlatformPushConfig {
  ios?: {
    apnsKeyId: string;
    apnsTeamId: string;
    apnsBundleId: string;
    apnsProduction: boolean;
  };
  android?: {
    fcmProjectId: string;
    fcmPrivateKey: string;
    defaultChannelId: string;
  };
}
