import { apiClient } from '@/src/api/client';
import type { FCMTokenRequest } from '@/src/types';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Firebase v23 호환 import 방식
let messaging: any = null;
let firebase: any = null;

try {
  // Expo Go 환경 체크 (expo-constants의 appOwnership이 'expo'인 경우 Expo Go)
  const isExpoGo = Constants.appOwnership === 'expo';
  
  if (!isExpoGo) {
    // Development Build나 실제 앱에서만 Firebase 로딩
    const firebaseApp = require('@react-native-firebase/app');
    firebase = firebaseApp.getApp ? firebaseApp : firebaseApp.default;
    
    // Firebase v23에서는 messaging을 함수로 호출해야 함
    const messagingModule = require('@react-native-firebase/messaging');
    if (typeof messagingModule === 'function') {
      messaging = messagingModule(); // v23: messaging() 호출
    } else if (messagingModule.default && typeof messagingModule.default === 'function') {
      messaging = messagingModule.default(); // v23: default() 호출
    } else if (messagingModule.default) {
      messaging = messagingModule.default; // 기존: default 직접 사용
    } else {
      messaging = messagingModule; // 최후: 모듈 직접 사용
    }
    
    console.log('[FIREBASE_PUSH] Firebase 모듈 로딩 성공');
    console.log('[FIREBASE_PUSH] firebase app:', !!firebase);
    console.log('[FIREBASE_PUSH] messaging 타입:', typeof messaging);
    console.log('[FIREBASE_PUSH] messaging 메서드들:', messaging ? Object.keys(messaging).slice(0, 10) : []);
  } else {
    console.log('[FIREBASE_PUSH] Expo Go 환경에서는 Firebase를 사용할 수 없습니다');
  }
} catch (error) {
  console.log('[FIREBASE_PUSH] Firebase 모듈을 사용할 수 없습니다:', error);
  messaging = null;
  firebase = null;
}

/**
 * Firebase 기반 푸시 알림 서비스
 * MSW 환경에서는 Mock 데이터로 동작하고, 실제 API가 구현되면 자동 전환
 */
export class FirebasePushService {
  private static instance: FirebasePushService;
  private fcmToken: string | null = null;
  private deviceId: string | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): FirebasePushService {
    if (!FirebasePushService.instance) {
      FirebasePushService.instance = new FirebasePushService();
    }
    return FirebasePushService.instance;
  }

  /**
   * Firebase 푸시 알림 초기화
   */
  public async initialize(): Promise<{ success: boolean; deviceId?: string }> {
    try {
      console.log('[FIREBASE_PUSH] 초기화 시작...');

      // Firebase 모듈이 없으면 완전히 실패로 처리 (Mock 토큰 생성하지 않음)
      if (!messaging) {
        console.error('[FIREBASE_PUSH] Firebase 모듈을 찾을 수 없습니다.');
        return { success: false };
      }

      // Firebase 준비 상태 확인
      try {
        if (!messaging) {
          console.error('[FIREBASE_PUSH] Firebase messaging 객체가 없습니다.');
          return { success: false };
        }
        
        // Firebase v23에서는 messaging이 객체이고 메서드들이 있는지 확인
        const hasRequiredMethods = messaging.requestPermission && 
                                 messaging.getToken && 
                                 messaging.onMessage;
        
        if (!hasRequiredMethods) {
          console.error('[FIREBASE_PUSH] Firebase messaging 필수 메서드가 없습니다.');
          console.error('[FIREBASE_PUSH] 사용 가능한 메서드들:', Object.keys(messaging));
          return { success: false };
        }
        
        console.log('[FIREBASE_PUSH] Firebase messaging 준비 완료');
      } catch (error) {
        console.error('[FIREBASE_PUSH] Firebase messaging 확인 실패:', error);
        return { success: false };
      }

      // 1. iOS 추가 설정 (Firebase v23에서는 자동으로 처리됨)
      if (Platform.OS === 'ios') {
        console.log('[FIREBASE_PUSH] iOS 환경 - Firebase가 자동으로 APNs를 처리합니다');
      }

      // 2. 권한 요청 (Expo Notifications와 Firebase 함께 사용)
      let authStatus: number;
      try {
        // 먼저 Expo Notifications로 사용자에게 친화적인 권한 요청
        const Notifications = await import('expo-notifications');
        const expoPermission = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: true,
            provideAppNotificationSettings: true,
            allowProvisional: false,
          },
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        
        console.log('[FIREBASE_PUSH] Expo 알림 권한 요청 결과:', expoPermission);
        
        if (expoPermission.status !== 'granted') {
          console.warn('[FIREBASE_PUSH] 알림 권한이 거부되었습니다.');
          console.warn('[FIREBASE_PUSH] 설정에서 알림을 허용해주세요.');
          return { success: false };
        }

        // Firebase 권한 요청 (플랫폼별 최적화)
        if (Platform.OS === 'ios') {
          authStatus = await messaging.requestPermission({
            alert: true,
            badge: true,
            sound: true,
            // Firebase v23에서 지원되는 옵션들만 사용
          });
        } else {
          // Android는 기본 권한 요청
          authStatus = await messaging.requestPermission();
        }
      } catch (permissionError) {
        console.error('[FIREBASE_PUSH] 권한 요청 실패:', permissionError);
        authStatus = 0; // DENIED
      }
      
      // Firebase v22 호환 권한 체크
      const enabled = 
        authStatus === 1 || // AUTHORIZED
        authStatus === 2;   // PROVISIONAL

      if (!enabled) {
        console.log('[FIREBASE_PUSH] 푸시 알림 권한이 거부되었습니다.');
        return { success: false };
      }

      console.log(`[FIREBASE_PUSH] ${Platform.OS} 권한 승인됨:`, authStatus);

      // 3. FCM 토큰 발급 (Firebase v23에서는 자동으로 APNs 처리)

      // FCM 토큰 발급
      try {
        this.fcmToken = await messaging.getToken();
        if (!this.fcmToken) {
          console.error('[FIREBASE_PUSH] FCM 토큰 발급 실패');
          return { success: false };
        }
        console.log('[FIREBASE_PUSH] FCM 토큰 발급 완료:', this.fcmToken.substring(0, 20) + '...');
      } catch (tokenError) {
        console.error('[FIREBASE_PUSH] FCM 토큰 발급 에러:', tokenError);
        return { success: false };
      }

      // 4. 디바이스 정보 수집
      const deviceInfo = await this.getDeviceInfo();

      // 5. 서버에 토큰 등록
      const tokenRequest: FCMTokenRequest = {
        fcmToken: this.fcmToken,
        deviceId: deviceInfo.deviceId,
        platform: Platform.OS as 'ios' | 'android',
        appVersion: deviceInfo.appVersion,
        osVersion: deviceInfo.osVersion,
      };

      // iOS APNs 토큰은 Firebase v23에서 자동으로 관리됨

      const response = await this.registerTokenToServer(tokenRequest);
      if (response.success) {
        this.deviceId = response.deviceId || deviceInfo.deviceId;
        this.isInitialized = true;
        console.log('[FIREBASE_PUSH] 서버 등록 완료, deviceId:', this.deviceId);
      }

      // 6. 메시지 리스너 설정
      this.setupMessageListeners();

      return { 
        success: response.success, 
        deviceId: this.deviceId || undefined 
      };

    } catch (error) {
      console.error('[FIREBASE_PUSH] 초기화 실패:', error);
      return { success: false };
    }
  }



  /**
   * 디바이스 정보 수집
   */
  private async getDeviceInfo() {
    const deviceId = await Device.getDeviceTypeAsync();
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const osVersion = Device.osVersion || 'unknown';

    return {
      deviceId: `${Platform.OS}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      appVersion,
      osVersion,
    };
  }

  /**
   * 서버에 FCM 토큰 등록
   */
  private async registerTokenToServer(request: FCMTokenRequest): Promise<{
    success: boolean;
    deviceId?: string;
    message?: string;
  }> {
    try {
      // MSW가 활성화된 경우 /api/notifications/register-fcm-token 엔드포인트로 요청
      const response = await apiClient.post('/api/notifications/register-fcm-token', request);
      
      return {
        success: true,
        deviceId: (response as any).deviceId || request.deviceId,
        message: 'FCM 토큰이 성공적으로 등록되었습니다.'
      };
    } catch (error) {
      console.error('[FIREBASE_PUSH] 서버 토큰 등록 실패:', error);
      
      // MSW 환경에서는 성공으로 처리 (실제 API가 없는 동안)
      if (__DEV__) {
        console.log('[FIREBASE_PUSH] 개발 환경에서 Mock 등록 성공 처리');
        return {
          success: true,
          deviceId: request.deviceId,
          message: 'FCM 토큰 Mock 등록 완료'
        };
      }

      return {
        success: false,
        message: '서버 토큰 등록에 실패했습니다.'
      };
    }
  }

  /**
   * Firebase 메시지 리스너 설정
   */
  private setupMessageListeners(): void {
    // Firebase 모듈이 없으면 리스너 설정 불가
    if (!messaging) {
      console.error('[FIREBASE_PUSH] Firebase 모듈이 없어 메시지 리스너를 설정할 수 없습니다.');
      return;
    }

    // 포그라운드 메시지 수신
    messaging.onMessage(async (remoteMessage: any) => {
      console.log('[FIREBASE_PUSH] 포그라운드 메시지 수신:', remoteMessage);
      
      // 로컬 알림으로 표시 (포그라운드에서는 자동 표시되지 않음)
      await this.showLocalNotification(remoteMessage);
      
      // 데이터 처리
      if (remoteMessage.data) {
        await this.handleNotificationData(remoteMessage.data);
      }
    });

    // 백그라운드/종료 상태에서 알림 클릭
    messaging.onNotificationOpenedApp((remoteMessage: any) => {
      console.log('[FIREBASE_PUSH] 백그라운드 알림 클릭:', remoteMessage);
      this.handleNotificationClick(remoteMessage);
    });

    // 앱이 종료된 상태에서 알림을 통해 앱 실행
    messaging
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('[FIREBASE_PUSH] 앱 종료 상태에서 알림을 통해 실행:', remoteMessage);
          this.handleNotificationClick(remoteMessage);
        }
      });

    // 토큰 갱신 리스너
    messaging.onTokenRefresh((token: string) => {
      console.log('[FIREBASE_PUSH] FCM 토큰 갱신:', token.substring(0, 20) + '...');
      this.fcmToken = token;
      // 서버에 새 토큰 업데이트
      this.updateTokenOnServer(token);
    });
  }

  /**
   * 포그라운드에서 로컬 알림 표시
   */
  private async showLocalNotification(remoteMessage: any): Promise<void> {
    try {
      // expo-notifications를 사용한 로컬 알림 표시
      const Notifications = await import('expo-notifications');
      
      console.log('[FIREBASE_PUSH] 로컬 알림 표시 시도:', remoteMessage.notification?.title);

      // 안드로이드에서 확실히 표시되도록 강화된 설정
      const notificationContent: any = {
        title: remoteMessage.notification?.title || remoteMessage.data?.title || '새 알림',
        body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
        data: remoteMessage.data || {},
        sound: 'default',
        badge: Platform.OS === 'ios' ? 1 : undefined,
      };

      // 안드로이드 특화 설정 - 간소화된 필수 옵션만
      if (Platform.OS === 'android') {
        notificationContent.android = {
          channelId: 'firebase',
          importance: Notifications.AndroidImportance.HIGH,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          color: '#FF0000',
          autoCancel: true,
          showWhen: true,
        };
      }

      // iOS 특화 설정 - 기본 옵션만
      if (Platform.OS === 'ios') {
        notificationContent.ios = {
          sound: 'default',
          badge: 1,
        };
      }
      
      // 즉시 알림 표시
      const identifier = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // 즉시 표시
      });
      
      console.log('[FIREBASE_PUSH] 로컬 알림 표시 완료, ID:', identifier);
    } catch (error) {
      console.error('[FIREBASE_PUSH] 로컬 알림 표시 실패:', error);
    }
  }

  /**
   * 알림 데이터 처리 (실시간 데이터 갱신 등)
   */
  private async handleNotificationData(data: any): Promise<void> {
    try {
      // 알림 타입에 따른 처리
      switch (data.type) {
        case 'budget_exceeded':
          // 예산 초과 알림: 관련 슬롯 데이터 새로고침
          console.log('[FIREBASE_PUSH] 예산 초과 알림 처리');
          // TODO: 슬롯 데이터 새로고침 로직
          break;

        case 'goal_achieved':
          // 목표 달성 알림: 축하 애니메이션 등
          console.log('[FIREBASE_PUSH] 목표 달성 알림 처리');
          break;

        case 'account_sync':
          // 계좌 동기화 완료: 계좌 데이터 새로고침
          console.log('[FIREBASE_PUSH] 계좌 동기화 완료 알림 처리');
          // TODO: 계좌 데이터 새로고침 로직
          break;

        case 'system':
          // 시스템 알림: 앱 업데이트, 공지사항 등
          console.log('[FIREBASE_PUSH] 시스템 알림 처리');
          break;

        default:
          console.log('[FIREBASE_PUSH] 알 수 없는 알림 타입:', data.type);
      }

      // 알림을 받았음을 서버에 알림 (읽지 않은 알림 개수 업데이트 등)
      if (data.notificationId) {
        await this.markNotificationAsReceived(data.notificationId);
      }
    } catch (error) {
      console.error('[FIREBASE_PUSH] 알림 데이터 처리 실패:', error);
    }
  }

  /**
   * 알림 클릭 처리 (화면 이동)
   */
  private handleNotificationClick(remoteMessage: any): void {
    try {
      const data = remoteMessage.data;
      
      if (data?.targetScreen) {
        console.log('[FIREBASE_PUSH] 화면 이동:', data.targetScreen);
        // TODO: React Navigation을 통한 화면 이동 구현
        // navigation.navigate(data.targetScreen, data.params);
      }

      if (data?.action) {
        console.log('[FIREBASE_PUSH] 액션 실행:', data.action);
        // TODO: 특정 액션 실행 (슬롯 상세 보기, 계좌 새로고침 등)
      }
    } catch (error) {
      console.error('[FIREBASE_PUSH] 알림 클릭 처리 실패:', error);
    }
  }

  /**
   * 서버에 토큰 업데이트
   */
  private async updateTokenOnServer(newToken: string): Promise<void> {
    try {
      if (!this.deviceId) return;

      await apiClient.put('/api/notifications/update-fcm-token', {
        fcmToken: newToken,
        deviceId: this.deviceId,
      });

      console.log('[FIREBASE_PUSH] 서버 토큰 업데이트 완료');
    } catch (error) {
      console.error('[FIREBASE_PUSH] 서버 토큰 업데이트 실패:', error);
    }
  }

  /**
   * 알림 수신 확인을 서버에 전송
   */
  private async markNotificationAsReceived(notificationId: string): Promise<void> {
    try {
      await apiClient.patch(`/api/notifications/${notificationId}/received`);
    } catch (error) {
      console.error('[FIREBASE_PUSH] 알림 수신 확인 실패:', error);
    }
  }



  /**
   * 현재 FCM 토큰 반환
   */
  public getFCMToken(): string | null {
    return this.fcmToken;
  }

  /**
   * 디바이스 ID 반환
   */
  public getDeviceId(): string | null {
    return this.deviceId;
  }

  /**
   * 초기화 상태 확인
   */
  public isReady(): boolean {
    return this.isInitialized && !!this.fcmToken && !!this.deviceId;
  }

  /**
   * 서비스 정리
   */
  public cleanup(): void {
    this.fcmToken = null;
    this.deviceId = null;
    this.isInitialized = false;
  }
}

// 싱글톤 인스턴스 export
export const firebasePushService = FirebasePushService.getInstance();