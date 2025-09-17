// ✅ 1. 폴리필을 다른 어떤 코드보다 먼저 import 합니다.
import '@/src/polyfills';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { queryClient } from '@/src/api/queryClient';
import { initializeMSW } from '@/src/mocks';
import { unifiedPushService } from '@/src/services/unifiedPushService';
import { settingsUtils } from '@/src/store';
// import { monitoringService } from '@/src/services';

// ✅ 개발 모드에서만 MSW를 초기화합니다.
if (__DEV__) {
  initializeMSW();
}

// 리소스(폰트, 온보딩 상태)를 가져오는 동안 스플래시 화면을 유지합니다.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // ... (다른 폰트 추가 가능)
  });
  // 온보딩 완료 여부: null은 아직 로딩 중을 의미
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  // 🐛 디버그용 함수: 온보딩을 다시 보기 위해 false로 설정
  const resetOnboarding = async () => {
    console.log('🔄 온보딩 리셋 시작');
    await settingsUtils.setOnboardingCompleted(false);
    setOnboardingDone(false);
    console.log('✅ 온보딩 리셋 완료 - onboardingDone:', false);
  };

  // 🐛 디버그용 함수: 온보딩 완료 상태로 설정
  const completeOnboarding = async () => {
    console.log('✅ 온보딩 완료 설정');
    await settingsUtils.setOnboardingCompleted(true);
    setOnboardingDone(true);
    console.log('✅ 온보딩 완료 설정됨 - onboardingDone:', true);
  };

  // 🐛 디버그용 함수: 현재 상태 확인
  const checkOnboardingStatus = async () => {
    const status = await settingsUtils.getOnboardingCompleted();
    console.log('📊 현재 온보딩 상태:', status);
    console.log('📊 현재 onboardingDone state:', onboardingDone);
  };

  // 🚀 디버그용 함수: 푸시 알림 서비스 초기화 테스트
  const initializePushService = async () => {
    console.log('🚀 푸시 서비스 초기화 시작');
    try {
      const result = await unifiedPushService.initialize();
      console.log('✅ 푸시 서비스 초기화 결과:', result);
      console.log('📊 푸시 서비스 상태:', unifiedPushService.getStatus());
    } catch (error) {
      console.error('❌ 푸시 서비스 초기화 실패:', error);
    }
  };



  // 전역 객체에 디버그 함수 등록 (개발 환경에서만)
  if (__DEV__) {
    (global as any).resetOnboarding = resetOnboarding;
    (global as any).completeOnboarding = completeOnboarding;
    (global as any).checkOnboardingStatus = checkOnboardingStatus;
    (global as any).initializePushService = initializePushService;
    (global as any).getPushStatus = () => unifiedPushService.getStatus();
  }
  
  // Expo Router는 Error Boundary를 사용해 네비게이션 트리의 에러를 처리합니다.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // 앱 시작 시 1회: 온보딩 완료 여부를 비동기로 조회
  useEffect(() => {
    (async () => {
      const done = await settingsUtils.getOnboardingCompleted();
      setOnboardingDone(done);
    })();
  }, []);

  // 폰트 로딩과 온보딩 상태 확인이 모두 완료되면 스플래시 화면을 숨깁니다.
  useEffect(() => {
    if (loaded && onboardingDone !== null) {
      SplashScreen.hideAsync();
    }
  }, [loaded, onboardingDone]);
  
  // 앱 시작 시 기타 초기화 로직
  useEffect(() => {
    // TODO: 실제 사용자 ID를 받아온 후 설정
    // monitoringService.setUserId('user_123');
    
    // 플랫폼별 알림 설정
    (async () => {
      try {
        const { setNotificationHandler } = await import('expo-notifications');
        
        // 포그라운드 알림 표시 방식 설정 (iOS, Android 공통)
        setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: Platform.OS === 'ios',
          }),
        });
        
        // 안드로이드 알림 채널 설정
        if (Platform.OS === 'android') {
          const Notifications = await import('expo-notifications');
          
          await Notifications.setNotificationChannelAsync('default', {
            name: 'WalletSlot 알림',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'default',
            showBadge: true,
          });

          // Firebase 전용 채널
          await Notifications.setNotificationChannelAsync('firebase', {
            name: 'Firebase 푸시 알림',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: 'default',
            showBadge: true,
          });
          
          console.log('✅ 안드로이드 알림 채널 설정 완료');
        }
        
        console.log(`✅ ${Platform.OS} 알림 핸들러 설정 완료`);
      } catch (error) {
        console.error(`❌ ${Platform.OS} 알림 핸들러 설정 실패:`, error);
      }
    })();
    
    // 푸시 서비스 자동 초기화 (온보딩 완료 후)
    if (onboardingDone) {
      (async () => {
        try {
          console.log('🔄 앱 시작 시 푸시 서비스 자동 초기화');
          const result = await unifiedPushService.initialize();
          console.log('✅ 푸시 서비스 자동 초기화 완료:', result);
        } catch (error) {
          console.error('❌ 푸시 서비스 자동 초기화 실패:', error);
        }
      })();
    }
  }, [onboardingDone]);

  // 폰트나 온보딩 상태가 로딩 중일 때는 아무것도 렌더링하지 않습니다.
  if (!loaded || onboardingDone === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            {/* 공통 컴포넌트 테스트
            <Stack.Screen name="(dev)" options={{ headerShown: false }} /> */}
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}