/**
 * @file unifiedPushService.ts
 * @description 푸시 알림 관련 서비스를 총괄하는 통합 인터페이스 (지휘자 역할).
 * 원격 알림은 FirebasePushService를, 로컬 알림 표시는 LocalNotificationService를 사용하도록 역할을 조율합니다.
 */
import { firebasePushService } from './firebasePushService';
import { localNotificationService } from './localNotificationService';

export class UnifiedPushService {
  private static instance: UnifiedPushService;
  private isFirebaseEnabled = false;

  private constructor() {}

  public static getInstance(): UnifiedPushService {
    if (!UnifiedPushService.instance) {
      UnifiedPushService.instance = new UnifiedPushService();
    }
    return UnifiedPushService.instance;
  }

  /**
   * 통합 푸시 알림 서비스를 초기화합니다.
   * 원격 알림을 위해 Firebase 서비스만 초기화합니다.
   */
  public async initialize(): Promise<{
    success: boolean;
    deviceId?: string;
  }> {
    console.log('[UNIFIED_PUSH] 통합 푸시 서비스 초기화 시작...');

    // Firebase 푸시 서비스만 초기화
    let firebaseResult: { success: boolean; deviceId?: string } = { success: false };
    
    try {
      firebaseResult = await firebasePushService.initialize();
      this.isFirebaseEnabled = firebaseResult.success;

      if (this.isFirebaseEnabled) {
        console.log('[UNIFIED_PUSH] Firebase 푸시 서비스 초기화 성공');
        console.log('[UNIFIED_PUSH] Device ID:', firebaseResult.deviceId);
      } else {
        console.log('[UNIFIED_PUSH] Firebase 푸시 서비스 초기화 실패');
      }
    } catch (error) {
      console.error('[UNIFIED_PUSH] Firebase 초기화 중 에러:', error);
      this.isFirebaseEnabled = false;
    }

    console.log('[UNIFIED_PUSH] 초기화 완료:', {
      overall: this.isFirebaseEnabled,
      firebase: this.isFirebaseEnabled,
    });

    return {
      success: this.isFirebaseEnabled,
      deviceId: firebaseResult.deviceId,
    };
  }

  /**
   * 사용자 로그인 시 필요한 푸시 관련 작업을 수행합니다.
   * (현재는 초기화 시 토큰 등록이 모두 처리되므로 추가 작업은 없음)
   */
  public async initializeForUser(userId: number): Promise<void> {
    if (this.isFirebaseEnabled) {
      // TODO: 서버에 userId와 deviceId를 연결하는 API 호출 등
      console.log(`[UNIFIED_PUSH] 사용자(${userId})에 대한 푸시 서비스 준비 완료`);
    }
  }

  /**
   * 사용자 로그아웃 시 푸시 토큰 연결을 해제합니다.
   */
  public async uninitializeForUser(): Promise<void> {
    if (this.isFirebaseEnabled) {
      // TODO: 서버에 deviceId의 사용자 연결을 해제하는 API 호출
      console.log('[UNIFIED_PUSH] Firebase 사용자 연결 해제');
    }
  }

  /**
   * 로컬 알림을 즉시 전송합니다.
   * LocalNotificationService에 작업을 위임합니다.
   */
  public async sendLocalNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    try {
      await localNotificationService.sendLocalNotification(title, body, data);
      return true;
    } catch (error) {
      console.error('[UNIFIED_PUSH] 로컬 알림 전송 실패:', error);
      return false;
    }
  }

  /**
   * 예약 알림을 전송합니다.
   * LocalNotificationService에 작업을 위임합니다.
   */
  public async scheduleNotification(
    title: string,
    body: string,
    delaySeconds: number,
    data?: any
  ): Promise<boolean> {
    try {
      await localNotificationService.scheduleNotification(title, body, delaySeconds, data);
      return true;
    } catch (error) {
      console.error('[UNIFIED_PUSH] 예약 알림 전송 실패:', error);
      return false;
    }
  }

  /**
   * 앱 아이콘 배지 개수를 설정합니다.
   * LocalNotificationService에 작업을 위임합니다.
   */
  public async setBadgeCount(count: number): Promise<void> {
    await localNotificationService.setBadgeCount(count);
  }

  /**
   * FCM 토큰을 반환합니다.
   */
  public getFCMToken(): string | null {
    if (this.isFirebaseEnabled) {
      return firebasePushService.getFCMToken();
    }
    return null;
  }

  /**
   * 현재 서비스 상태 정보를 반환합니다.
   */
  public getStatus() {
    return {
      firebase: {
        enabled: this.isFirebaseEnabled,
        token: firebasePushService.getFCMToken(),
        deviceId: firebasePushService.getDeviceId(),
        ready: firebasePushService.isReady(),
      },
    };
  }
  
  public cleanup(): void {
    if (this.isFirebaseEnabled) {
      firebasePushService.cleanup();
    }
    localNotificationService.cleanup();
    this.isFirebaseEnabled = false;
  }
}

// 싱글톤 인스턴스 export
export const unifiedPushService = UnifiedPushService.getInstance();