// ✅ 1. 폴리필을 다른 어떤 코드보다 먼저 import 합니다.
import '@/src/polyfills';
import AsyncStorage from '@react-native-async-storage/async-storage'; //개발 디버그 함수용
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
import CustomSplashScreen from '@/src/components/CustomSplashScreen';
// import { initializeMSW } from '@/src/mocks';
import { appService } from '@/src/services/appService';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { unifiedPushService } from '@/src/services/unifiedPushService';
// import { monitoringService } from '@/src/services';

// ✅ MSW 완전 비활성화 - 실제 API 사용
// if (__DEV__) {
//   initializeMSW();
// }

// 리소스(폰트, 온보딩 상태)를 가져오는 동안 스플래시 화면을 유지합니다.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // ... (다른 폰트 추가 가능)
  });
  // 온보딩 완료 여부: 직접 AsyncStorage에서 관리
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  // 스플래시 최소 표시 시간을 위한 상태
  const [splashMinTimeElapsed, setSplashMinTimeElapsed] = useState(false);
  // 커스텀 스플래시 화면 표시 여부
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  // 🐛 디버그용 함수: 온보딩을 다시 보기 위해 false로 설정
  const resetOnboarding = async () => {
    console.log('🔄 온보딩 리셋 시작');
    await appService.setOnboardingCompleted(false);
    setOnboardingDone(false);
    console.log('✅ 온보딩 리셋 완료 - onboardingDone:', false);
  };

  // 🐛 디버그용 함수: 온보딩 완료 상태로 설정
  const completeOnboarding = async () => {
    console.log('✅ 온보딩 완료 설정');
    await appService.setOnboardingCompleted(true);
    setOnboardingDone(true);
    console.log('✅ 온보딩 완료 설정됨 - onboardingDone:', true);
  };

  // 🧹 디버그용 함수: 회원가입 임시 데이터(예: 이름) 제거
  const clearSignupName = async () => {
    try {
      await AsyncStorage.removeItem('signup:name');
      console.log('🧹 signup:name cleared');
    } catch (e) {
      console.warn('Failed to clear signup:name', e);
    }
  };

  // 🧨 디버그용 함수: AsyncStorage 전체 비우기 (주의)
  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log('🧨 AsyncStorage cleared');
    } catch (e) {
      console.warn('Failed to clear AsyncStorage', e);
    }
  };

  // 🐛 디버그용 함수: 현재 상태 확인
  const checkOnboardingStatus = async () => {
    const status = await appService.getOnboardingCompleted();
    console.log('📊 현재 온보딩 상태:', status);
    console.log('📊 현재 onboardingDone state:', onboardingDone);
  };

  // 🐛 디버그용 함수: deviceId 상태 확인
  const checkDeviceId = async () => {
    try {
      const deviceId = await getOrCreateDeviceId();
      console.log('📱 현재 DeviceId:', deviceId);
    } catch (error) {
      console.error('❌ DeviceId 조회 실패:', error);
    }
  };

  // 🔍 디버그용 함수: AsyncStorage에 저장된 모든 데이터 조회
  const checkAllAsyncStorageData = async () => {
    try {
      console.log('🔍 AsyncStorage 전체 데이터 조회 시작');
      const keys = await AsyncStorage.getAllKeys();
      console.log('📋 저장된 키 목록:', keys);
      
      const allData = await AsyncStorage.multiGet(keys);
      console.log('📊 모든 데이터:');
      allData.forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      
      console.log('✅ AsyncStorage 전체 데이터 조회 완료');
    } catch (error) {
      console.error('❌ AsyncStorage 데이터 조회 실패:', error);
    }
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
    (global as any).checkDeviceId = checkDeviceId;
    (global as any).checkAllAsyncStorageData = checkAllAsyncStorageData;
    (global as any).clearSignupName = clearSignupName;
    (global as any).clearAsyncStorage = clearAsyncStorage;
    (global as any).initializePushService = initializePushService;
    (global as any).getPushStatus = () => unifiedPushService.getStatus();
  }
  
  // Expo Router는 Error Boundary를 사용해 네비게이션 트리의 에러를 처리합니다.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // 앱 시작 시 1회: deviceId 초기화 및 온보딩 완료 여부를 비동기로 조회
  useEffect(() => {
    (async () => {
      try {
        // deviceId 초기화 (없으면 생성, 있으면 기존 값 사용)
        const deviceId = await getOrCreateDeviceId();
        console.log('✅ DeviceId 초기화 완료:', deviceId);
        
        // 온보딩 완료 여부 조회
        const completed = await appService.getOnboardingCompleted();
        setOnboardingDone(completed);
      } catch (error) {
        console.error('❌ 앱 초기화 실패:', error);
        // deviceId 초기화 실패해도 앱은 계속 실행
        const completed = await appService.getOnboardingCompleted();
        setOnboardingDone(completed);
      }
    })();
  }, []);

  // 스플래시 최소 표시 시간 (3초) 보장
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashMinTimeElapsed(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // 폰트 로딩과 앱 초기화가 완료되면 스플래시 화면을 숨깁니다.
  useEffect(() => {
    if (loaded && onboardingDone !== null && splashMinTimeElapsed) {
      // 네이티브 스플래시 숨기기
      SplashScreen.hideAsync();
      
      // 커스텀 스플래시 추가 표시 시간 (2초)
      setTimeout(() => {
        setShowCustomSplash(false);
      }, 2000);
    }
  }, [loaded, onboardingDone, splashMinTimeElapsed]);
  
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

  // 커스텀 스플래시 화면 표시
  if (showCustomSplash) {
    return <CustomSplashScreen />;
  }

  // 폰트 로딩 중이거나 온보딩 상태 확인 중일 때는 스플래시 화면 유지
  if (!loaded || onboardingDone === null) {
    return <CustomSplashScreen />;
  }

  // 라우팅 로직: 온보딩 완료 여부에 따라 다른 화면으로 이동
  const getInitialRoute = () => {
    if (onboardingDone === false) {
      // 온보딩 미완료 → 온보딩 화면
      return '(onboarding)';
    }
    
    // 온보딩 완료 → 메인 앱 (인증 상태는 각 화면에서 처리)
    return '(tabs)';
  };

  const initialRoute = getInitialRoute();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack initialRouteName={initialRoute}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(mydata)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            {/* 공통 컴포넌트 테스트
            <Stack.Screen name="(dev)" options={{ headerShown: false }} /> */}
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}