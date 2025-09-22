/**
 * @file localNotificationService.ts
 * @description expo-notifications를 사용한 로컬(Local) 알림 전담 서비스.
 * 원격 푸시 알림 수신 후 화면에 표시, 예약 알림, 테스트 알림 등 기기 자체의 알림 기능을 담당합니다.
 */
import type * as NotificationsType from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/constants';

async function getNotifications(): Promise<typeof NotificationsType | null> {
  try {
    // dynamic import for cross-platform compatibility
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const mod = await import('expo-notifications');
    return mod as typeof NotificationsType;
  } catch (e) {
    return null;
  }
}

/**
 * 로컬 알림 서비스 (Singleton)
 * expo-notifications를 래핑하여 로컬 알림 생성, 스케줄링, 상호작용 처리를 담당합니다.
 */
export class LocalNotificationService {
  private static instance: LocalNotificationService;
  private listeners: (() => void)[] = [];

  private constructor() {
    this.setupNotificationListeners();
    this.setupBackgroundNotificationHandler();
  }

  public static getInstance(): LocalNotificationService {
    if (!LocalNotificationService.instance) {
      LocalNotificationService.instance = new LocalNotificationService();
    }
    return LocalNotificationService.instance;
  }

  private setupNotificationListeners(): void {
    (async () => {
      const Notifications = await getNotifications();
      if (!Notifications) return;

      // 앱이 켜져있을 때 알림을 수신하는 리스너
      const foregroundSubscription = Notifications.addNotificationReceivedListener(
        (notification: any) => {
          console.log('[LOCAL_NOTIF] 포그라운드에서 알림 수신:', notification.request.content.title);
          // 필요 시 추가적인 데이터 처리 로직 구현
        }
      );

      // 사용자가 알림을 탭했을 때 반응하는 리스너
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          this.handleNotificationResponse(response);
        }
      );

      // 앱이 꺼진 상태에서 알림을 통해 실행되었을 경우 처리
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        if (response) this.handleNotificationResponse(response);
      } catch (e) {
        // ignore if unavailable
      }

      this.listeners.push(() => {
        foregroundSubscription.remove();
        responseSubscription.remove();
      });
    })();
  }

  private handleNotificationResponse(response: NotificationsType.NotificationResponse): void {
    const data = response.notification.request.content.data;
    console.log('[LOCAL_NOTIF] 알림 응답 처리:', data);

    // TODO: Expo Router 또는 React Navigation을 사용한 실제 네비게이션 로직 구현
    // 예: router.push('/(tabs)/dashboard');
    if (data?.targetScreen) {
      console.log(`화면 이동 필요: ${data.targetScreen}`);
    }
  }

  private setupBackgroundNotificationHandler(): void {
    (async () => {
      const Notifications = await getNotifications();
      if (!Notifications) return;
      try {
        // 앱 시작 시 배지 카운트 초기화
        await Notifications.setBadgeCountAsync(0);
      } catch (e) {
        // ignore
      }
    })();
  }

  /**
   * 로컬 알림을 즉시 전송합니다.
   */
  public async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
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
   * 지정된 시간 후에 로컬 알림을 예약합니다.
   */
  public async scheduleNotification(
    title: string,
    body: string,
    delaySeconds: number,
    data?: Record<string, any>
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
        seconds: Math.max(1, Math.floor(delaySeconds)),
      } as any,
    });
  }

  /**
   * 개발 및 테스트를 위한 다양한 로컬 알림 시나리오
   */
  public testNotifications = {
    immediate: async (): Promise<void> => {
      await this.sendLocalNotification('즉시 알림 테스트', '테스트 알림입니다', {
        action: 'test_immediate',
        targetScreen: '/notifications',
      });
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
  };

  /**
   * 앱 아이콘의 배지 카운트를 설정합니다.
   */
  public async setBadgeCount(count: number): Promise<void> {
    const Notifications = await getNotifications();
    if (!Notifications) return;
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * 알림 권한 상태를 확인하거나 요청합니다.
   */
  public async ensurePermissions(): Promise<boolean> {
    const Notifications = await getNotifications();
    if (!Notifications) return false;

    const permission = await Notifications.getPermissionsAsync();
    if (permission.status === 'granted') {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_CONSENT, 'true');
      return true;
    }

    // 권한 요청 (사용자가 명시적으로 호출한 경우)
    const newPermission = await Notifications.requestPermissionsAsync();
    const granted = newPermission.status === 'granted';
    
    if (granted) {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_CONSENT, 'true');
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_CONSENT, 'false');
    }
    
    return granted;
  }

  public cleanup(): void {
    this.listeners.forEach(cleanup => cleanup());
    this.listeners = [];
  }
}

// 싱글톤 인스턴스를 지연 로딩(lazy loading) 프록시로 export 합니다.
// 이는 앱 시작 시 또는 웹과 같이 지원되지 않는 환경에서 불필요한 API 호출을 방지합니다.
const _localNotificationServiceProxy: any = new Proxy(
  {},
  {
    get(_target, prop: string) {
      const inst = LocalNotificationService.getInstance();
      const val = (inst as any)[prop];
      if (typeof val === 'function') return val.bind(inst);
      return val;
    },
    set(_target, prop: string, value) {
      const inst = LocalNotificationService.getInstance();
      (inst as any)[prop] = value;
      return true;
    },
  }
);

export const localNotificationService = _localNotificationServiceProxy;