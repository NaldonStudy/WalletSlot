import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import type { NotificationItem, PushTokenRequest } from '@/src/types';

// 알림 표시 방식 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,   // 배너 형태로 알림 표시
    shouldShowList: true,     // 알림 센터에 목록으로 표시
    shouldPlaySound: true,    // 소리 재생
    shouldSetBadge: true,     // 앱 아이콘 배지 표시
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;
  private listeners: (() => void)[] = [];

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 푸시 알림 시스템 초기화
   * 권한 요청 → 토큰 발급 → 리스너 설정
   */
  public async initialize(): Promise<string | null> {
    try {
      // 1. 푸시 토큰 발급
      this.pushToken = await this.registerForPushNotifications();
      
      // 2. 알림 리스너 설정
      this.setupNotificationListeners();
      
      // 3. 백그라운드 알림 처리 설정
      this.setupBackgroundNotificationHandler();
      
      console.log('🔔 푸시 알림 시스템 초기화 완료');
      return this.pushToken;
    } catch (error) {
      console.error('❌ 푸시 알림 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 푸시 토큰 발급 및 권한 요청
   */
  private async registerForPushNotifications(): Promise<string | null> {
    let token: string | null = null;

    // 실제 기기에서만 푸시 알림 작동 (시뮬레이터 X)
    if (Device.isDevice) {
      // 1. 현재 권한 상태 확인
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // 2. 권한이 없으면 요청
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // 3. 권한이 거부되면 경고 (에러는 발생시키지 않음)
      if (finalStatus !== 'granted') {
        console.warn('⚠️ 푸시 알림 권한이 거부되었습니다. 로컬 알림만 사용합니다.');
        return null;
      }

      // 4. 푸시 토큰 발급 (Expo Go에서는 실패할 수 있음)
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        
        token = tokenData.data;
        console.log('🎯 푸시 토큰 발급 완료:', token);
      } catch (error) {
        console.warn('⚠️ 푸시 토큰 발급 실패 (Expo Go 제한):', error);
        console.log('📱 로컬 알림만 사용합니다.');
        // 에러를 던지지 않고 null 반환
        return null;
      }
    } else {
      console.warn('⚠️ 실제 기기에서만 푸시 알림을 사용할 수 있습니다.');
    }

    return token;
  }

  /**
   * 알림 수신 및 클릭 리스너 설정
   */
  private setupNotificationListeners(): void {
    // 1. Foreground에서 알림 수신 시
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('🟢 Foreground 알림 수신:', notification.request.content);
        
        // 커스텀 처리 (예: 인앱 알림 표시, 데이터 새로고침 등)
        const data = notification.request.content.data;
        if (data?.action === 'refresh_data') {
          console.log('📊 데이터 새로고침 실행');
          // TODO: 데이터 새로고침 로직 추가
        }
      }
    );

    // 2. 알림 클릭/탭 시 (모든 상태에서)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 알림 클릭됨:', {
          actionIdentifier: response.actionIdentifier,
          data: response.notification.request.content.data
        });

        // 알림 클릭 시 화면 이동 처리
        this.handleNotificationResponse(response);
      }
    );

    // 3. 앱이 Background/Killed 상태에서 알림으로 시작된 경우
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          console.log('🚀 앱이 알림으로 시작됨:', response);
          this.handleNotificationResponse(response);
        }
      });

    // 리스너 정리 함수 저장
    this.listeners.push(() => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    });
  }

  /**
   * 알림 클릭 시 화면 이동 처리
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data;
    
    if (data?.targetScreen) {
      // TODO: 실제 네비게이션 로직 추가
      console.log(`🧭 화면 이동: ${data.targetScreen}`);
      // router.push(data.targetScreen);
    }
    
    if (data?.slotId) {
      console.log(`💰 슬롯 상세로 이동: ${data.slotId}`);
      // router.push(`/slots/${data.slotId}`);
    }

    if (data?.accountId) {
      console.log(`🏦 계좌 상세로 이동: ${data.accountId}`);
      // router.push(`/accounts/${data.accountId}`);
    }
  }

  /**
   * 백그라운드 알림 처리 설정
   */
  private setupBackgroundNotificationHandler(): void {
    // 배지 초기화
    Notifications.setBadgeCountAsync(0);
  }

  /**
   * 로컬 알림 전송 (테스트용)
   */
  public async sendLocalNotification(
    title: string, 
    body: string, 
    data?: any
  ): Promise<void> {
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
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        badge: 1,
        data,
      },
      trigger: { seconds: delaySeconds },
    });
  }

  /**
   * 테스트 알림들
   */
  public testNotifications = {
    immediate: async (): Promise<void> => {
      await this.sendLocalNotification(
        '즉시 알림 테스트 🔔',
        '앱 상태와 관계없이 수신됩니다',
        {
          action: 'test_immediate',
          targetScreen: '/notifications',
          timestamp: Date.now()
        }
      );
    },

    delayed: async (delaySeconds: number = 5): Promise<void> => {
      await this.scheduleNotification(
        '지연 알림 테스트 ⏰',
        `${delaySeconds}초 후 도착하는 알림입니다`,
        delaySeconds,
        {
          action: 'test_delayed',
          targetScreen: '/dashboard',
        }
      );
    },

    budgetExceeded: async (slotName: string, amount: number): Promise<void> => {
      await this.sendLocalNotification(
        '⚠️ 예산 초과 알림',
        `${slotName} 슬롯이 ${amount.toLocaleString()}원 초과했습니다`,
        {
          action: 'budget_exceeded',
          targetScreen: '/dashboard',
          slotName,
          amount,
          type: 'budget_exceeded'
        }
      );
    },

    goalAchieved: async (slotName: string): Promise<void> => {
      await this.sendLocalNotification(
        '🎉 목표 달성!',
        `${slotName} 슬롯의 목표를 달성했습니다!`,
        {
          action: 'goal_achieved',
          targetScreen: '/dashboard',
          slotName,
          type: 'goal_achieved'
        }
      );
    },

    accountSync: async (bankName: string): Promise<void> => {
      await this.sendLocalNotification(
        '🔄 계좌 동기화 완료',
        `${bankName} 계좌 정보가 업데이트되었습니다`,
        {
          action: 'account_sync',
          targetScreen: '/dashboard',
          bankName,
          type: 'account_sync'
        }
      );
    },
  };

  /**
   * 서버에 푸시 토큰 등록용 데이터 생성
   */
  public getPushTokenData(): PushTokenRequest | null {
    if (!this.pushToken) {
      return null;
    }

    return {
      deviceId: `device_${Date.now()}`, // TODO: 실제 deviceId 생성 로직
      token: this.pushToken,
      platform: Platform.OS as 'android' | 'ios',
      // userId는 실제 로그인 상태에서 추가
    };
  }

  /**
   * 현재 푸시 토큰 반환
   */
  public getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * 배지 카운트 설정
   */
  public async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * 모든 알림 권한 상태 확인
   */
  public async getPermissionStatus(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  /**
   * 리소스 정리
   */
  public cleanup(): void {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }
}

// 싱글톤 인스턴스 export
export const notificationService = NotificationService.getInstance();
