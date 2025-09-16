/**
 * @file featureFlags.ts
 * @description 런타임에서 토글 가능한 기능 플래그 모음.
 * 빌드타임 환경변수(Expo 공개 변수)로 초기값을 주고, 필요 시 앱 구동 중 업데이트.
 */

// 초기값: 환경 변수 → 문자열 'true'/'false'
const initialNotificationFallback = (process.env.EXPO_PUBLIC_ENABLE_NOTIFICATION_FALLBACK ?? 'true') === 'true';

let notificationFallbackEnabled = initialNotificationFallback;

export const featureFlags = {
  /** 알림 목록 fallback fetch 사용 여부 */
  isNotificationFallbackEnabled(): boolean {
    return notificationFallbackEnabled;
  },
  /** 런타임에서 fallback 기능 on/off (디버깅/실험용) */
  setNotificationFallbackEnabled(enabled: boolean) {
    notificationFallbackEnabled = enabled;
    console.log('[FEATURE_FLAGS] notificationFallbackEnabled ->', enabled);
  },
  /** 현재 플래그 상태 스냅샷 */
  snapshot() {
    return {
      notificationFallbackEnabled,
    } as const;
  }
};
