import { apiClient } from '@/src/api/client';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { getAccessToken } from '@/src/services/tokenService';
import type { FCMTokenRequest } from '@/src/types';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Firebase v23 호환 import 방식 (모듈식 API 지원)
let messagingApp: any = null; // messaging() 인스턴스
let messagingMod: any = null; // 모듈식 함수 집합 (getToken, onMessage 등)
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
    messagingMod = messagingModule; // 모듈식 함수들이 여기에 존재할 수 있음
    // messaging() 인스턴스 확보
    try {
      if (typeof messagingModule?.messaging === 'function') {
        messagingApp = messagingModule.messaging();
      } else if (typeof messagingModule === 'function') {
        messagingApp = messagingModule();
      } else if (typeof messagingModule?.default === 'function') {
        messagingApp = messagingModule.default();
      } else if (messagingModule?.default?.messaging) {
        messagingApp = messagingModule.default.messaging();
      }
    } catch {}

    console.log('[FIREBASE_PUSH] Firebase 모듈 로딩 성공');
    console.log('[FIREBASE_PUSH] firebase app:', !!firebase);
    console.log('[FIREBASE_PUSH] messagingApp 존재:', !!messagingApp);
    console.log('[FIREBASE_PUSH] 모듈식 메서드들:', messagingMod ? Object.keys(messagingMod).slice(0, 10) : []);
  } else {
    console.log('[FIREBASE_PUSH] Expo Go 환경에서는 Firebase를 사용할 수 없습니다');
  }
} catch (error) {
  console.log('[FIREBASE_PUSH] Firebase 모듈을 사용할 수 없습니다:', error);
  messagingApp = null;
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
      if (!messagingApp && !messagingMod) {
        console.error('[FIREBASE_PUSH] Firebase 모듈을 찾을 수 없습니다.');
        return { success: false };
      }

      // Firebase 준비 상태 확인
      try {
        if (!messagingApp && !messagingMod) {
          console.error('[FIREBASE_PUSH] Firebase messaging 객체가 없습니다.');
          return { success: false };
        }
        console.log('[FIREBASE_PUSH] Firebase messaging 준비 확인 완료');
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
        const requestPermission = messagingMod?.requestPermission;
        if (requestPermission && typeof requestPermission === 'function') {
          // 모듈식 API
          if (Platform.OS === 'ios') {
            authStatus = await requestPermission(messagingMod.messaging ? messagingMod.messaging() : messagingApp, {
              alert: true,
              badge: true,
              sound: true,
            });
          } else {
            authStatus = await requestPermission(messagingMod.messaging ? messagingMod.messaging() : messagingApp);
          }
        } else if (messagingApp?.requestPermission) {
          // 인스턴스 메서드 (구 API)
          if (Platform.OS === 'ios') {
            authStatus = await messagingApp.requestPermission({ alert: true, badge: true, sound: true });
          } else {
            authStatus = await messagingApp.requestPermission();
          }
        } else {
          // 권한 요청 불가
          authStatus = 0;
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
        if (typeof messagingMod?.getToken === 'function') {
          this.fcmToken = await messagingMod.getToken(messagingMod.messaging ? messagingMod.messaging() : messagingApp);
        } else if (messagingApp?.getToken) {
          this.fcmToken = await messagingApp.getToken();
        } else {
          this.fcmToken = null as any;
        }
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

      // 5. 서버에 토큰 등록 준비
      const tokenRequest: FCMTokenRequest = {
        fcmToken: this.fcmToken,
        deviceId: deviceInfo.deviceId,
        platform: Platform.OS as 'ios' | 'android',
        appVersion: deviceInfo.appVersion,
        osVersion: deviceInfo.osVersion,
      };

      // iOS APNs 토큰은 Firebase v23에서 자동으로 관리됨

      // 아직 인증되지 않았다면 서버 등록을 건너뜁니다(401 방지)
      const accessToken = await getAccessToken();
      if (!accessToken) {
        if (__DEV__) {
          console.log('[FIREBASE_PUSH] 아직 로그인 전입니다. 서버 등록은 로그인 이후로 지연합니다.');
        }
        // 디바이스 ID는 로컬 추정값 설정
        this.deviceId = deviceInfo.deviceId;
        // 초기화는 완료 처리하되, 서버 연동은 ensureServerRegistration에서 수행
        this.isInitialized = false;
      } else {
        const response = await this.registerTokenToServer(tokenRequest);
        if (response.success) {
          this.deviceId = response.deviceId || deviceInfo.deviceId;
          this.isInitialized = true;
          console.log('[FIREBASE_PUSH] 서버 등록 완료, deviceId:', this.deviceId);
        }
      }

      // 6. 메시지 리스너 설정
      this.setupMessageListeners();

      // 서버 등록을 지연했더라도, 클라이언트 설정은 완료됨
      return {
        success: true,
        deviceId: this.deviceId || deviceInfo.deviceId || undefined,
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
    const persistedDeviceId = await getOrCreateDeviceId();
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const osVersion = Device.osVersion || 'unknown';

    return {
      deviceId: persistedDeviceId,
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
      // 백엔드 명세: POST /api/push/endpoints (등록/갱신 겸용)
      const payload = {
        deviceId: request.deviceId,
        platform: Platform.OS === 'ios' ? 'IOS' as const : 'ANDROID' as const,
        token: request.fcmToken,
        pushEnabled: true,
      };
      const response: any = await apiClient.postWithConfig('/api/push/endpoints', payload, { noRefresh: true });
      const serverDeviceId = response?.data?.device?.deviceId || response?.deviceId;
      return {
        success: true,
        deviceId: serverDeviceId || request.deviceId,
        message: 'FCM 토큰이 성공적으로 등록되었습니다.'
      };
    } catch (error) {
      if (__DEV__) {
        console.error('[FIREBASE_PUSH] 서버 토큰 등록 실패:', error);
      } else {
        console.warn('[FIREBASE_PUSH] 서버 토큰 등록 실패(요약).');
      }
      
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
   * 로그인 이후(액세스 토큰 보유 시) 서버에 안전하게 토큰을 등록합니다.
   * 초기화 시 401이 났다면, 인증 후 이 메서드를 다시 호출하세요.
   */
  public async ensureServerRegistration(): Promise<boolean> {
    try {
      if (!this.fcmToken) return false;
      const { getAccessToken } = await import('@/src/services/tokenService');
      const at = await getAccessToken();
      if (!at) {
        if (__DEV__) console.log('[FIREBASE_PUSH] access token 없음. 서버 등록 건너뜀');
        return false;
      }
      const deviceInfo = await this.getDeviceInfo();
      const payload: FCMTokenRequest = {
        fcmToken: this.fcmToken,
        deviceId: this.deviceId || deviceInfo.deviceId,
        platform: Platform.OS as 'ios' | 'android',
        appVersion: Constants.expoConfig?.version || '1.0.0',
        osVersion: Device.osVersion || 'unknown',
      };
      const res = await this.registerTokenToServer(payload);
      if (res.success) {
        this.deviceId = res.deviceId || payload.deviceId;
        this.isInitialized = true;
      }
      return res.success;
    } catch (e) {
      return false;
    }
  }

  /**
   * Firebase 메시지 리스너 설정
   */
  private setupMessageListeners(): void {
    // Firebase 모듈이 없으면 리스너 설정 불가
    if (!messagingApp && !messagingMod) {
      console.error('[FIREBASE_PUSH] Firebase 모듈이 없어 메시지 리스너를 설정할 수 없습니다.');
      return;
    }

    // 포그라운드 메시지 수신
    const onMessage = messagingMod?.onMessage;
    if (typeof onMessage === 'function') {
      onMessage(messagingMod.messaging ? messagingMod.messaging() : messagingApp, async (remoteMessage: any) => {
        console.log('[FIREBASE_PUSH] 포그라운드 메시지 수신:', remoteMessage);
        await this.showLocalNotification(remoteMessage);
        if (remoteMessage.data) {
          await this.handleNotificationData(remoteMessage.data);
        }
      });
    } else if (messagingApp?.onMessage) {
      messagingApp.onMessage(async (remoteMessage: any) => {
      console.log('[FIREBASE_PUSH] 포그라운드 메시지 수신:', remoteMessage);
      
      // 로컬 알림으로 표시 (포그라운드에서는 자동 표시되지 않음)
      await this.showLocalNotification(remoteMessage);
      
      // 데이터 처리
      if (remoteMessage.data) {
        await this.handleNotificationData(remoteMessage.data);
      }
      });
    }

    // 백그라운드/종료 상태에서 알림 클릭
    const onNotificationOpenedApp = messagingMod?.onNotificationOpenedApp;
    if (typeof onNotificationOpenedApp === 'function') {
      onNotificationOpenedApp(messagingMod.messaging ? messagingMod.messaging() : messagingApp, (remoteMessage: any) => {
        console.log('[FIREBASE_PUSH] 백그라운드 알림 클릭:', remoteMessage);
        this.handleNotificationClick(remoteMessage);
      });
    } else if (messagingApp?.onNotificationOpenedApp) {
      messagingApp.onNotificationOpenedApp((remoteMessage: any) => {
        console.log('[FIREBASE_PUSH] 백그라운드 알림 클릭:', remoteMessage);
        this.handleNotificationClick(remoteMessage);
      });
    }

    // 앱이 종료된 상태에서 알림을 통해 앱 실행
    const getInitialNotification = messagingMod?.getInitialNotification;
    if (typeof getInitialNotification === 'function') {
      getInitialNotification(messagingMod.messaging ? messagingMod.messaging() : messagingApp).then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('[FIREBASE_PUSH] 앱 종료 상태에서 알림을 통해 실행:', remoteMessage);
          this.handleNotificationClick(remoteMessage);
        }
      });
    } else if (messagingApp?.getInitialNotification) {
      messagingApp.getInitialNotification().then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('[FIREBASE_PUSH] 앱 종료 상태에서 알림을 통해 실행:', remoteMessage);
          this.handleNotificationClick(remoteMessage);
        }
      });
    }

    // 토큰 갱신 리스너
    const onTokenRefresh = messagingMod?.onTokenRefresh;
    if (typeof onTokenRefresh === 'function') {
      onTokenRefresh(messagingMod.messaging ? messagingMod.messaging() : messagingApp, (token: string) => {
        console.log('[FIREBASE_PUSH] FCM 토큰 갱신:', token.substring(0, 20) + '...');
        this.fcmToken = token;
        this.updateTokenOnServer(token);
      });
    } else if (messagingApp?.onTokenRefresh) {
      messagingApp.onTokenRefresh((token: string) => {
        console.log('[FIREBASE_PUSH] FCM 토큰 갱신:', token.substring(0, 20) + '...');
        this.fcmToken = token;
        this.updateTokenOnServer(token);
      });
    }
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

      // 등록과 동일 엔드포인트(POST /api/push/endpoints)는 갱신도 지원
      await apiClient.postWithConfig('/api/push/endpoints', {
        deviceId: this.deviceId,
        platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
        token: newToken,
        pushEnabled: true,
      }, { noRefresh: true });

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