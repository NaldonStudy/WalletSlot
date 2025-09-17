import { firebasePushService } from './firebasePushService';
import { notificationService } from './notificationService';

/**
 * 통합 푸시 알림 서비스
 * Firebase와 Expo Notifications를 함께 사용하는 통합 인터페이스
 */
export class UnifiedPushService {
  private static instance: UnifiedPushService;
  private isFirebaseEnabled = false;
  private isExpoEnabled = false;

  private constructor() {}

  public static getInstance(): UnifiedPushService {
    if (!UnifiedPushService.instance) {
      UnifiedPushService.instance = new UnifiedPushService();
    }
    return UnifiedPushService.instance;
  }

  /**
   * 통합 푸시 알림 서비스 초기화
   * Firebase와 Expo Notifications를 동시에 초기화
   */
  public async initialize(): Promise<{
    success: boolean;
    firebase: { enabled: boolean; deviceId?: string };
    expo: { enabled: boolean; deviceId?: string };
  }> {
    console.log('[UNIFIED_PUSH] 통합 푸시 서비스 초기화 시작...');

    const results = {
      success: false,
      firebase: { enabled: false as boolean, deviceId: undefined as string | undefined },
      expo: { enabled: false as boolean, deviceId: undefined as string | undefined }
    };

    // 1. Firebase 푸시 서비스 초기화
    try {
      const firebaseResult = await firebasePushService.initialize();
      results.firebase.enabled = firebaseResult.success;
      results.firebase.deviceId = firebaseResult.deviceId;
      this.isFirebaseEnabled = firebaseResult.success;
      
      if (firebaseResult.success) {
        console.log('[UNIFIED_PUSH] Firebase 푸시 서비스 초기화 성공');
      } else {
        console.log('[UNIFIED_PUSH] Firebase 푸시 서비스 초기화 실패');
      }
    } catch (error) {
      console.error('[UNIFIED_PUSH] Firebase 초기화 중 오류:', error);
    }

    // 2. Expo Notifications 서비스 초기화 (기존 서비스)
    try {
      const expoResult = await notificationService.registerInitialToken();
      results.expo.enabled = expoResult.success;
      results.expo.deviceId = expoResult.deviceId;
      this.isExpoEnabled = expoResult.success;
      
      if (expoResult.success) {
        console.log('[UNIFIED_PUSH] Expo 푸시 서비스 초기화 성공');
      } else {
        console.log('[UNIFIED_PUSH] Expo 푸시 서비스 초기화 실패');
      }
    } catch (error) {
      console.error('[UNIFIED_PUSH] Expo 초기화 중 오류:', error);
    }

    // 3. 최소 하나라도 성공하면 전체 성공으로 간주
    results.success = this.isFirebaseEnabled || this.isExpoEnabled;

    console.log('[UNIFIED_PUSH] 초기화 완료:', {
      overall: results.success,
      firebase: results.firebase.enabled,
      expo: results.expo.enabled
    });

    return results;
  }

  /**
   * 사용자 로그인 시 푸시 설정
   */
  public async initializeForUser(userId: number): Promise<boolean> {
    let success = false;

    if (this.isFirebaseEnabled) {
      try {
        // Firebase 서비스에 사용자 연결
        console.log('[UNIFIED_PUSH] Firebase 사용자 연결:', userId);
        success = true;
      } catch (error) {
        console.error('[UNIFIED_PUSH] Firebase 사용자 연결 실패:', error);
      }
    }

    if (this.isExpoEnabled) {
      try {
        await notificationService.linkTokenToUser(userId);
        console.log('[UNIFIED_PUSH] Expo 사용자 연결 완료:', userId);
        success = true;
      } catch (error) {
        console.error('[UNIFIED_PUSH] Expo 사용자 연결 실패:', error);
      }
    }

    return success;
  }

  /**
   * 사용자 로그아웃 시 푸시 설정 해제
   */
  public async uninitializeForUser(): Promise<void> {
    if (this.isFirebaseEnabled) {
      // Firebase에서 사용자 연결 해제
      console.log('[UNIFIED_PUSH] Firebase 사용자 연결 해제');
    }

    if (this.isExpoEnabled) {
      await notificationService.unlinkTokenFromUser();
      console.log('[UNIFIED_PUSH] Expo 사용자 연결 해제');
    }
  }

  /**
   * 로컬 알림 전송 (즉시)
   */
  public async sendLocalNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    if (this.isExpoEnabled) {
      try {
        await notificationService.sendLocalNotification(title, body, data);
        return true;
      } catch (error) {
        console.error('[UNIFIED_PUSH] 로컬 알림 전송 실패:', error);
      }
    }
    return false;
  }

  /**
   * 예약 알림 전송
   */
  public async scheduleNotification(
    title: string,
    body: string,
    delaySeconds: number,
    data?: any
  ): Promise<boolean> {
    if (this.isExpoEnabled) {
      try {
        await notificationService.scheduleNotification(title, body, delaySeconds, data);
        return true;
      } catch (error) {
        console.error('[UNIFIED_PUSH] 예약 알림 전송 실패:', error);
      }
    }
    return false;
  }

  /**
   * 테스트 푸시 알림 전송
   */
  public async sendTestPush(payload: {
    title: string;
    body: string;
    type: string;
    data?: any;
  }): Promise<{ success: boolean; method: string; message: string }> {
    // Firebase 우선 시도
    if (this.isFirebaseEnabled) {
      try {
        const result = await firebasePushService.sendTestPush(payload);
        if (result.success) {
          return {
            success: true,
            method: 'firebase',
            message: result.message
          };
        }
      } catch (error) {
        console.error('[UNIFIED_PUSH] Firebase 테스트 푸시 실패:', error);
      }
    }

    // Firebase 실패 시 Expo 로컬 알림으로 대체
    if (this.isExpoEnabled) {
      try {
        await notificationService.sendLocalNotification(
          payload.title,
          payload.body,
          payload.data
        );
        return {
          success: true,
          method: 'expo_local',
          message: '로컬 알림으로 전송되었습니다.'
        };
      } catch (error) {
        console.error('[UNIFIED_PUSH] Expo 로컬 알림 실패:', error);
      }
    }

    return {
      success: false,
      method: 'none',
      message: '사용 가능한 푸시 서비스가 없습니다.'
    };
  }

  /**
   * 앱 배지 개수 설정
   */
  public async setBadgeCount(count: number): Promise<void> {
    if (this.isExpoEnabled) {
      await notificationService.setBadgeCount(count);
    }
  }

  /**
   * 알림 권한 상태 확인
   */
  public async getPermissionStatus(): Promise<{
    firebase: any;
    expo: any;
  }> {
    const result: { firebase: any; expo: any } = {
      firebase: null,
      expo: null
    };

    if (this.isFirebaseEnabled) {
      // Firebase 권한 상태는 messaging().hasPermission() 등으로 확인
      result.firebase = { status: 'granted', timestamp: Date.now() }; // Mock
    }

    if (this.isExpoEnabled) {
      result.expo = await notificationService.getPermissionStatus();
    }

    return result;
  }

  /**
   * 테스트 시나리오들
   */
  public testScenarios = {
    /**
     * 예산 초과 시나리오
     */
    budgetExceeded: async (slotName: string, amount: number) => {
      const payload = {
        title: '예산 초과 알림',
        body: `${slotName} 슬롯이 ${amount.toLocaleString()}원 초과했습니다`,
        type: 'budget_exceeded',
        data: {
          action: 'budget_exceeded',
          slotName,
          amount,
          targetScreen: '/(tabs)/dashboard'
        }
      };

      return await this.sendTestPush(payload);
    },

    /**
     * 목표 달성 시나리오
     */
    goalAchieved: async (slotName: string) => {
      const payload = {
        title: '목표 달성! 🎉',
        body: `${slotName} 슬롯의 목표를 달성했습니다!`,
        type: 'goal_achieved',
        data: {
          action: 'goal_achieved',
          slotName,
          targetScreen: '/(tabs)/dashboard'
        }
      };

      return await this.sendTestPush(payload);
    },

    /**
     * 계좌 동기화 시나리오
     */
    accountSync: async (bankName: string) => {
      const payload = {
        title: '계좌 동기화 완료',
        body: `${bankName} 계좌 정보가 업데이트되었습니다`,
        type: 'account_sync',
        data: {
          action: 'account_sync',
          bankName,
          targetScreen: '/(tabs)/profile'
        }
      };

      return await this.sendTestPush(payload);
    },

    /**
     * 지출 패턴 알림 시나리오
     */
    spendingPattern: async (category: string, changePercent: number) => {
      const increase = changePercent > 0;
      const payload = {
        title: '지출 패턴 분석',
        body: `이번 주 ${category} 지출이 평소보다 ${Math.abs(changePercent)}% ${increase ? '증가' : '감소'}했습니다`,
        type: 'spending_pattern',
        data: {
          action: 'spending_pattern',
          category,
          changePercent,
          targetScreen: '/(tabs)/report'
        }
      };

      return await this.sendTestPush(payload);
    }
  };

  /**
   * 서비스 상태 정보
   */
  public getStatus() {
    return {
      firebase: {
        enabled: this.isFirebaseEnabled,
        token: firebasePushService.getFCMToken(),
        deviceId: firebasePushService.getDeviceId(),
        ready: firebasePushService.isReady()
      },
      expo: {
        enabled: this.isExpoEnabled,
        token: notificationService.getPushToken(),
        deviceId: notificationService.getDeviceId()
      }
    };
  }

  /**
   * 서비스 정리
   */
  public cleanup(): void {
    if (this.isFirebaseEnabled) {
      firebasePushService.cleanup();
    }
    if (this.isExpoEnabled) {
      notificationService.cleanup();
    }
    
    this.isFirebaseEnabled = false;
    this.isExpoEnabled = false;
  }
}

// 싱글톤 인스턴스 export
export const unifiedPushService = UnifiedPushService.getInstance();