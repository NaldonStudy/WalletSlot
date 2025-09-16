import Constants from 'expo-constants';
import * as Device from 'expo-device';
import type * as NotificationsType from 'expo-notifications';
import { Platform } from 'react-native';

async function getNotifications(): Promise<typeof NotificationsType | null> {
  try {
    // dynamic import prevents Metro from resolving native module at bundle-time
    // on unsupported platforms
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const mod = await import('expo-notifications');
    return mod as typeof NotificationsType;
  } catch (e) {
    return null;
  }
}

import type { InitialTokenRequest, UpdateTokenRequest } from '@/src/types';
// TODO: 실제 API 연동시 주석 해제
// import { notificationApi } from '@/src/api/notification';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

// We'll set notification handler lazily when Notifications is available.

/**
 * 푸시 알림 서비스 (Singleton)
 */
export class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;
  private deviceId: string | null = null;
  private listeners: (() => void)[] = [];
  private lastSentToken: string | null = null;

  private constructor() {
    this.setupNotificationListeners();
    this.setupBackgroundNotificationHandler();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 최초 토큰 등록
   */
  public async registerInitialToken(): Promise<{ success: boolean; deviceId?: string }> {
    try {
      const Notifications = await getNotifications();
      if (!Notifications) return { success: false };

      const permission = await Notifications.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        return { success: false };
      }

      this.pushToken = await this.requestPushToken();
      if (!this.pushToken) {
        return { success: false };
      }

      const requestData: InitialTokenRequest = {
        token: this.pushToken,
        platform: Platform.OS as 'ios' | 'android'
      };

      // TODO: 실제 API 연동
      // const response = await notificationApi.registerInitialPushToken(requestData);
      // this.deviceId = response.deviceId;
      
      // MOCK: 임시 deviceId 생성
      this.deviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      this.lastSentToken = this.pushToken;

      return { success: true, deviceId: this.deviceId };
    } catch (error) {
      console.error('최초 토큰 등록 실패:', error);
      return { success: false };
    }
  }

  /**
   * 토큰 갱신 체크
   */
  public async checkAndUpdateToken(): Promise<boolean> {
    try {
      if (!this.deviceId) {
        return false;
      }

      const Notifications = await getNotifications();
      if (!Notifications) return false;

      const permission = await Notifications.getPermissionsAsync();
      if (permission.status !== 'granted') {
        return false;
      }

      const currentToken = await this.requestPushToken();
      if (!currentToken) {
        return false;
      }

      if (this.pushToken === currentToken) {
        return true;
      }

      const requestData: UpdateTokenRequest = {
        token: currentToken,
        deviceId: this.deviceId
      };

      // TODO: 실제 API 연동
      // await notificationApi.updatePushToken(requestData);

      this.pushToken = currentToken;
      this.lastSentToken = currentToken;

      return true;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      return false;
    }
  }

  private async requestPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice || isExpoGo) {
        return null;
      }

      const Notifications = await getNotifications();
      if (!Notifications) return null;

      const tokenResponse = await Notifications.getExpoPushTokenAsync();
      return tokenResponse.data;
    } catch (error) {
      console.error('토큰 발급 실패:', error);
      return null;
    }
  }

  private setupNotificationListeners(): void {
    // lazy setup: attempt to load Notifications and attach listeners if available
    (async () => {
      const Notifications = await getNotifications();
      if (!Notifications) return;

      const foregroundSubscription = Notifications.addNotificationReceivedListener(
        (notification: any) => {
          const data = notification.request.content.data;
          if (data?.action === 'refresh_data') {
            // TODO: 실제 데이터 새로고침 로직
          }
        }
      );

      const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          this.handleNotificationResponse(response);
        }
      );

      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        if (response) this.handleNotificationResponse(response);
      } catch (e) {
        // ignore unavailable
      }

      this.listeners.push(() => {
        foregroundSubscription.remove();
        responseSubscription.remove();
      });
    })();
  }

  private handleNotificationResponse(response: NotificationsType.NotificationResponse): void {
    const data = response.notification.request.content.data;
    
    // TODO: 실제 네비게이션 로직
    if (data?.targetScreen) {
      console.log(`화면 이동: ${data.targetScreen}`);
    }
    
    if (data?.slotId) {
      console.log(`슬롯 상세: ${data.slotId}`);
    }

    if (data?.accountId) {
      console.log(`계좌 상세: ${data.accountId}`);
    }
  }

  private setupBackgroundNotificationHandler(): void {
    (async () => {
      const Notifications = await getNotifications();
      if (!Notifications) return;
      try {
        await Notifications.setBadgeCountAsync(0);
      } catch (e) {
        // ignore
      }
    })();
  }

  /**
   * 로컬 알림 전송 (테스트용)
   */
  public async sendLocalNotification(
    title: string, 
    body: string, 
    data?: any
  ): Promise<void> {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        badge: 1,
        data,
      },
      trigger: null, // 즉시 전송
    });
  }

  /**
   * 예약 알림 전송
   */
  public async scheduleNotification(
    title: string,
    body: string,
    delaySeconds: number,
    data?: any
  ): Promise<void> {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        badge: 1,
        data,
      },
      trigger: {
        // runtime enum
        type: (Notifications as any).SchedulableTriggerInputTypes?.TIME_INTERVAL ?? 'timeInterval',
        seconds: delaySeconds,
      } as any,
    });
  }

  public testNotifications = {
    immediate: async (): Promise<void> => {
      await this.sendLocalNotification(
        '즉시 알림 테스트',
        '테스트 알림입니다',
        { action: 'test_immediate', targetScreen: '/notifications' }
      );
    },

    delayed: async (delaySeconds: number = 5): Promise<void> => {
      await this.scheduleNotification(
        '지연 알림 테스트',
        `${delaySeconds}초 후 알림`,
        delaySeconds,
        { action: 'test_delayed', targetScreen: '/dashboard' }
      );
    },

    budgetExceeded: async (slotName: string, amount: number): Promise<void> => {
      await this.sendLocalNotification(
        '예산 초과 알림',
        `${slotName} 슬롯이 ${amount.toLocaleString()}원 초과했습니다`,
        { action: 'budget_exceeded', slotName, amount, type: 'budget_exceeded' }
      );
    },

    goalAchieved: async (slotName: string): Promise<void> => {
      await this.sendLocalNotification(
        '목표 달성!',
        `${slotName} 슬롯의 목표를 달성했습니다!`,
        { action: 'goal_achieved', slotName, type: 'goal_achieved' }
      );
    },

    accountSync: async (bankName: string): Promise<void> => {
      await this.sendLocalNotification(
        '계좌 동기화 완료',
        `${bankName} 계좌 정보가 업데이트되었습니다`,
        { action: 'account_sync', bankName, type: 'account_sync' }
      );
    },
  };

  public getDeviceId(): string | null {
    return this.deviceId;
  }

  public setDeviceId(deviceId: string): void {
    this.deviceId = deviceId;
  }

  public getPushToken(): string | null {
    return this.pushToken;
  }

  public async initializeForLoggedInUser(): Promise<void> {
    await this.checkAndUpdateToken();
  }

  public async linkTokenToUser(userId: number): Promise<void> {
    if (this.deviceId) {
      await this.checkAndUpdateToken();
    }
  }

  public async unlinkTokenFromUser(): Promise<void> {
    // TODO: 실제 API 연동 - 사용자 연결 해제
  }

  public async handleNotificationToggle(enabled: boolean): Promise<boolean> {
    if (!enabled) {
      // TODO: 실제 API 연동 - 알림 설정 비활성화
      return true;
    }

    return await this.ensureValidToken();
  }

  private async ensureValidToken(): Promise<boolean> {
    try {
      const Notifications = await getNotifications();
      if (!Notifications) return false;

      const permission = await Notifications.getPermissionsAsync();
      if (permission.status !== 'granted') {
        const newPermission = await Notifications.requestPermissionsAsync();
        if (newPermission.status !== 'granted') {
          return false;
        }
      }

      if (!this.pushToken || !this.deviceId) {
        const result = await this.registerInitialToken();
        return result.success;
      }

      try {
        const currentToken = await this.requestPushToken();
        if (!currentToken) {
          throw new Error('토큰 요청 실패');
        }
        
        if (this.pushToken !== currentToken) {
          return await this.checkAndUpdateToken();
        } else {
          return true;
        }
      } catch (tokenError) {
        const result = await this.registerInitialToken();
        return result.success;
      }
    } catch (error) {
      console.error('토큰 확보 실패:', error);
      return false;
    }
  }



  public async setBadgeCount(count: number): Promise<void> {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    await Notifications.setBadgeCountAsync(count);
  }

  public async getPermissionStatus(): Promise<NotificationsType.NotificationPermissionsStatus | null> {
    const Notifications = await getNotifications();
    if (!Notifications) return null;
    return await Notifications.getPermissionsAsync();
  }

  public cleanup(): void {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }
}

// 싱글톤 인스턴스 export
// Export a lazy proxy that will create the NotificationService singleton only when
// a method/property is first accessed. This prevents the module from eagerly
// instantiating NotificationService (which calls expo-notifications APIs) during
// app startup or on unsupported platforms (web / Expo Go).
const _notificationServiceProxy: any = new Proxy({}, {
  get(_target, prop: string) {
    const inst = NotificationService.getInstance();
    // @ts-ignore
    const val = (inst as any)[prop];
    if (typeof val === 'function') return val.bind(inst);
    return val;
  },
  set(_target, prop: string, value) {
    const inst = NotificationService.getInstance();
    // @ts-ignore
    (inst as any)[prop] = value;
    return true;
  }
});

export const notificationService = _notificationServiceProxy;
