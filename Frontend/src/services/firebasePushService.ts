import { apiClient } from '@/src/api/client';
import type { FCMTokenRequest } from '@/src/types';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Firebase 모듈을 안전하게 import (Expo Go에서는 null 반환)
let messaging: any = null;

try {
  // Expo Go 환경 체크 (expo-constants의 appOwnership이 'expo'인 경우 Expo Go)
  const isExpoGo = Constants.appOwnership === 'expo';
  
  if (!isExpoGo) {
    // Development Build나 실제 앱에서만 Firebase 로딩
    messaging = require('@react-native-firebase/messaging').default;
    console.log('[FIREBASE_PUSH] Firebase 모듈 로딩 성공');
  } else {
    console.log('[FIREBASE_PUSH] Expo Go 환경에서는 Firebase를 사용할 수 없습니다');
  }
} catch (error) {
  console.log('[FIREBASE_PUSH] Firebase 모듈을 사용할 수 없습니다:', error);
  messaging = null;
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

      // Firebase 모듈이 없으면 Mock 모드로 동작
      if (!messaging) {
        console.log('[FIREBASE_PUSH] Firebase 모듈이 없습니다. Mock 모드로 동작합니다.');
        return await this.initializeMockMode();
      }

      // 1. iOS 추가 설정
      if (Platform.OS === 'ios') {
        // iOS에서 APNs 등록 (Firebase에서 자동으로 처리되지만 명시적으로 호출)
        await messaging().registerDeviceForRemoteMessages();
        console.log('[FIREBASE_PUSH] iOS APNs 등록 완료');
      }

      // 2. 권한 요청 (플랫폼별 권한 설정)
      const authStatus = await messaging().requestPermission(
        Platform.OS === 'ios' ? {
          sound: true,
          announcement: true,
          badge: true,
          carPlay: true,
          criticalAlert: true,
          provisional: false,
          alert: true,
        } : {
          sound: true,
          badge: true,
          alert: true,
        }
      );
      
      const enabled = 
        authStatus === messaging().AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging().AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('[FIREBASE_PUSH] 푸시 알림 권한이 거부되었습니다.');
        return { success: false };
      }

      console.log(`[FIREBASE_PUSH] ${Platform.OS} 권한 승인됨:`, authStatus);

      // 3. FCM 토큰 발급 (iOS에서는 APNs 토큰이 필요할 수 있음)
      if (Platform.OS === 'ios') {
        // iOS에서는 APNs 토큰을 먼저 확인
        const apnsToken = await messaging().getAPNSToken();
        if (apnsToken) {
          console.log('[FIREBASE_PUSH] iOS APNs 토큰 확인됨');
        } else {
          console.warn('[FIREBASE_PUSH] iOS APNs 토큰이 없습니다. FCM 토큰 발급에 영향을 줄 수 있습니다.');
        }
      }

      this.fcmToken = await messaging().getToken();
      if (!this.fcmToken) {
        console.error('[FIREBASE_PUSH] FCM 토큰 발급 실패');
        return { success: false };
      }

      console.log('[FIREBASE_PUSH] FCM 토큰 발급 완료:', this.fcmToken.substring(0, 20) + '...');

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

      // iOS에서는 APNs 토큰도 함께 전송 (Firebase 모듈이 있을 때만)
      if (Platform.OS === 'ios' && messaging) {
        const apnsToken = await messaging().getAPNSToken();
        if (apnsToken) {
          tokenRequest.apnsToken = apnsToken;
          console.log('[FIREBASE_PUSH] APNs 토큰 포함하여 서버 등록');
        }
      }

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
   * Mock 모드 초기화 (Expo Go 환경용)
   */
  private async initializeMockMode(): Promise<{ success: boolean; deviceId?: string }> {
    try {
      // Mock FCM 토큰 생성
      this.fcmToken = `mock_fcm_token_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      
      // 디바이스 정보 수집
      const deviceInfo = await this.getDeviceInfo();
      this.deviceId = deviceInfo.deviceId;
      this.isInitialized = true;

      console.log('[FIREBASE_PUSH] Mock 모드 초기화 완료');
      console.log('[FIREBASE_PUSH] Mock FCM 토큰:', this.fcmToken.substring(0, 20) + '...');
      console.log('[FIREBASE_PUSH] DeviceId:', this.deviceId);

      return { 
        success: true, 
        deviceId: this.deviceId 
      };
    } catch (error) {
      console.error('[FIREBASE_PUSH] Mock 모드 초기화 실패:', error);
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
    // Firebase 모듈이 없으면 Mock 리스너 설정
    if (!messaging) {
      console.log('[FIREBASE_PUSH] Mock 메시지 리스너 설정 완료');
      return;
    }

    // 포그라운드 메시지 수신
    messaging().onMessage(async (remoteMessage: any) => {
      console.log('[FIREBASE_PUSH] 포그라운드 메시지 수신:', remoteMessage);
      
      // 로컬 알림으로 표시 (포그라운드에서는 자동 표시되지 않음)
      await this.showLocalNotification(remoteMessage);
      
      // 데이터 처리
      if (remoteMessage.data) {
        await this.handleNotificationData(remoteMessage.data);
      }
    });

    // 백그라운드/종료 상태에서 알림 클릭
    messaging().onNotificationOpenedApp((remoteMessage: any) => {
      console.log('[FIREBASE_PUSH] 백그라운드 알림 클릭:', remoteMessage);
      this.handleNotificationClick(remoteMessage);
    });

    // 앱이 종료된 상태에서 알림을 통해 앱 실행
    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('[FIREBASE_PUSH] 앱 종료 상태에서 알림을 통해 실행:', remoteMessage);
          this.handleNotificationClick(remoteMessage);
        }
      });

    // 토큰 갱신 리스너
    messaging().onTokenRefresh((token: string) => {
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
      const { scheduleNotificationAsync } = await import('expo-notifications');
      
      const notificationContent = {
        title: remoteMessage.notification?.title || '새 알림',
        body: remoteMessage.notification?.body || '',
        sound: Platform.OS === 'ios' ? 'default' : 'default',
        badge: Platform.OS === 'ios' ? 1 : undefined,
        data: remoteMessage.data || {},
      };

      // iOS 특화 설정
      if (Platform.OS === 'ios') {
        (notificationContent as any).categoryIdentifier = 'GENERAL';
        (notificationContent as any).launchImageName = 'splash-icon';
      }
      
      await scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // 즉시 표시
      });
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
   * 테스트 푸시 알림 전송 (개발용)
   */
  public async sendTestPush(payload: {
    title: string;
    body: string;
    type: string;
    data?: any;
  }): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.fcmToken) {
        return { success: false, message: 'FCM 토큰이 없습니다.' };
      }

      const response = await apiClient.post('/api/notifications/send-test-push', {
        token: this.fcmToken,
        payload,
      });

      return { success: true, message: '테스트 푸시 알림이 전송되었습니다.' };
    } catch (error) {
      console.error('[FIREBASE_PUSH] 테스트 푸시 전송 실패:', error);
      return { success: false, message: '테스트 푸시 전송에 실패했습니다.' };
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