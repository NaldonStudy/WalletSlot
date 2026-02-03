/**
 * @file 앱의 진입점 역할을 하는 루트 레이아웃 컴포넌트입니다.
 * @description 이 파일은 앱의 생명주기 동안 필요한 초기화, 상태 관리, 라우팅을 총괄합니다.
 */

// ✅ Polyfill은 다른 어떤 코드보다 먼저 import 되어야 합니다.
import '@/src/polyfills';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { router, SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { queryClient } from '@/src/api/queryClient';
import CustomSplashScreen from '@/src/components/CustomSplashScreen';
import { featureFlags } from '@/src/config/featureFlags';
import { initializeMSW, isMSWEnabled } from '@/src/mocks';
import { appService } from '@/src/services/appService';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { getAccessToken, needsRefreshSoon } from '@/src/services/tokenService';
import { unifiedPushService } from '@/src/services/unifiedPushService';
import { useAuthStore } from '@/src/store/authStore';

// 개발(dev) 환경이고, MSW(Mock Service Worker)가 활성화된 경우에만 초기화합니다.
if (__DEV__ && isMSWEnabled()) {
  initializeMSW();
}

// 모든 필수 리소스(폰트, 상태 등)가 로드될 때까지 네이티브 스플래시 화면을 유지합니다.
SplashScreen.preventAutoHideAsync();

/**
 * 앱의 루트 레이아웃 컴포넌트입니다.
 * 앱의 시작점(entry point)으로서 다음과 같은 핵심 역할을 수행합니다.
 * - 폰트, 기기 ID, 인증 상태 등 앱 실행에 필요한 리소스와 상태를 초기화합니다.
 * - 모든 초기화가 완료될 때까지 스플래시 화면을 제어합니다.
 * - 인증 및 온보딩 상태에 따라 사용자에게 보여줄 첫 화면을 결정하고 안내(라우팅)합니다.
 * - 앱 전역에서 사용될 Provider(QueryClient, Theme 등)를 설정합니다.
 * - 선제적 토큰 갱신, 푸시 알림 설정 등 백그라운드 서비스를 관리합니다.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const authLoading = useAuthStore(state => state.isLoading);
  
  const [fontLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  // 마이데이터 연결 완료 여부: featureFlags에서 관리
  const [myDataConnectDone, setMyDataConnectDone] = useState<boolean | null>(null);
  // 스플래시 최소 표시 시간을 위한 상태
  const [splashMinTimeElapsed, setSplashMinTimeElapsed] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  /**
   * 폰트 로딩 중 발생한 에러를 Expo Router의 Error Boundary로 전달합니다.
   */
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  /**
   * 앱 시작 시 단 한 번 실행되는 비동기 초기화 로직입니다.
   * 기기 ID, 온보딩 상태, 인증 상태를 최대한 빠르게 확인합니다.
   */
  useEffect(() => {
    async function initializeApp() {
      try {
        // 앱 실행에 필수적인 기기 ID를 먼저 확보합니다.
        await getOrCreateDeviceId();

        // 온보딩 완료 여부를 비동기적으로 확인합니다. (최대 800ms 대기)
        const completed = await Promise.race([
          appService.getOnboardingCompleted(),
          new Promise<boolean>(resolve => setTimeout(() => resolve(false), 800)),
        ]);
        setOnboardingDone(completed);
        // 마이데이터 연결 완료 여부 조회
        let myDataConnectCompleted = featureFlags.isMyDataConnectEnabled();
        console.log('[APP_INIT] myDataConnect 상태 초기화:', {
          값: myDataConnectCompleted,
          시간: new Date().toISOString()
        });
        
        setMyDataConnectDone(myDataConnectCompleted);
        // 인증 상태 초기 확인
        await useAuthStore.getState().checkAuthStatus();

        // 인증 상태 확인은 백그라운드에서 실행하여 화면 로딩을 막지 않습니다.
        useAuthStore.getState().checkAuthStatus().catch(e => console.error('초기 인증 체크 실패:', e));
      } catch (error) {
        console.error('앱 초기화 중 오류:', error);
        const completed = await appService.getOnboardingCompleted();
        setOnboardingDone(completed);
        let myDataConnectCompleted = featureFlags.isMyDataConnectEnabled();
        console.log('[APP_INIT] myDataConnect 상태 초기화 (에러 시):', {
          값: myDataConnectCompleted,
          시간: new Date().toISOString()
        });
        
        setMyDataConnectDone(myDataConnectCompleted);
      }
    }

    initializeApp();
  }, []);

  /**
   * 스플래시 화면이 최소 3초간 표시되도록 보장합니다.
   * 로딩이 너무 빨라도 브랜드 로고를 충분히 인지할 수 있게 합니다.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashMinTimeElapsed(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  /**
   * 모든 준비(폰트, 온보딩 확인, 최소 시간)가 완료되면 스플래시 화면을 숨깁니다.
   */
  useEffect(() => {
    if (fontLoaded && onboardingDone !== null && myDataConnectDone !== null && splashMinTimeElapsed) {
      // 네이티브 스플래시 숨기기
      SplashScreen.hideAsync();
      
      // 네이티브 스플래시가 사라진 후, 부드러운 화면 전환을 위해
      // 커스텀 스플래시를 2초간 추가로 표시합니다.
      setTimeout(() => {
        setShowCustomSplash(false);
      }, 2000);
    }
  }, [fontLoaded, onboardingDone, myDataConnectDone, splashMinTimeElapsed]);

  
  // 앱 시작 시 기타 초기화 로직 + 선제 토큰 갱신
  useEffect(() => {
    // 아직 인증 상태를 확인 중이거나 스플래시가 보이는 중에는 라우팅을 실행하지 않습니다.
    if (authLoading || showCustomSplash) {
      return;
    }

    if (isLoggedIn) {
      router.replace('/(tabs)/dashboard');
    } else if (onboardingDone) {
      router.replace('/(auth)/(signup)/name');
    } else if (onboardingDone === false) {
      router.replace('/(onboarding)/onboarding');
    }
  }, [isLoggedIn, authLoading, onboardingDone, showCustomSplash]);

  /**
   * 알림 및 푸시 서비스 관련 초기화를 담당합니다.
   * 온보딩 완료 여부에 따라 푸시 서비스 초기화를 진행합니다.
   */
  useEffect(() => {
    async function setupNotifications() {
      try {
        const { setNotificationHandler } = await import('expo-notifications');
        setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: Platform.OS === 'ios',
          }),
        });

        if (Platform.OS === 'android') {
          const Notifications = await import('expo-notifications');
          await Notifications.setNotificationChannelAsync('default', {
            name: 'WalletSlot 알림',
            importance: Notifications.AndroidImportance.HIGH,
          });
        }
      } catch (error) {
        console.error('알림 설정 중 오류:', error);
      }
    }
    
    setupNotifications();

    if (onboardingDone) {
      unifiedPushService.initialize().catch(e => console.error('❌ 푸시 서비스 초기화 오류:', e));
    }
  }, [onboardingDone]);

  /**
   * 앱이 활성화될 때마다 로그인 토큰이 곧 만료되는지 확인하고,
   * 필요한 경우 백그라운드에서 조용히 갱신합니다.
   */
  useEffect(() => {
    const maybeSilentRefresh = async () => {
      try {
        const accessToken = await getAccessToken();
        if (accessToken && needsRefreshSoon(accessToken, 90)) {
          await useAuthStore.getState().refreshAccessToken();
        }
      } catch (e) {
        console.error('토큰 선제 갱신 실패:', e);
      }
    };

    maybeSilentRefresh(); // 앱 시작 시 1회 즉시 실행

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        maybeSilentRefresh();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // 푸시 서버 등록 보장 헬퍼
  const firebasePushEnsure = async () => {
    try {
      const { firebasePushService } = await import('@/src/services/firebasePushService');
      await firebasePushService.ensureServerRegistration();
    } catch {}
  };

  // 커스텀 스플래시 화면 표시
  if (showCustomSplash) {
    console.log('⏳ [ROUTING] 커스텀 스플래시 화면 표시 중...');
    return <CustomSplashScreen />;
  }

  // 폰트 로딩, 온보딩 상태, 마이데이터 연결 상태, 또는 인증 상태 확인 중일 때 스플래시 유지
  if (!fontLoaded || onboardingDone === null || myDataConnectDone === null || authLoading) {
    console.log('⏳ [ROUTING] 스플래시 화면 유지 중...', {
      fontLoaded,
      onboardingDone,
      myDataConnectDone,
      authLoading
    });
    return <CustomSplashScreen />;
  }

  // 라우팅 로직: 온보딩, 마이데이터 연결, 로그인 상태에 따라 다른 화면으로 이동
  const getInitialRoute = () => {
    console.log('🚀 [ROUTING] 앱 진입 시 라우팅 결정 시작');
    console.log('[ROUTING] 상태 확인:', {
      onboardingDone,
      myDataConnectDone,
      isLoggedIn,
      authLoading,
      fontLoaded,
      splashMinTimeElapsed
    });
    
    if (onboardingDone === false) {
      // 온보딩 미완료 → 온보딩 화면
      console.log('📍 [ROUTING] → (onboarding) - 온보딩 미완료');
      return '(onboarding)';
    }
    
    if (onboardingDone === true && myDataConnectDone === false) {
      // 온보딩 완료 + 마이데이터 연결 미완료 → 마이데이터 연결 화면
      console.log('📍 [ROUTING] → (mydata) - 마이데이터 연결 미완료');
      return '(mydata)';
    }
    
    if (onboardingDone === true && myDataConnectDone === true && isLoggedIn === true) {
      // 온보딩 완료 + 마이데이터 연결 완료 + 로그인 완료 → 메인 앱
      console.log('📍 [ROUTING] → (tabs) - 모든 조건 만족');
      return '(tabs)';
    }
    
    // 그 외의 경우 (로그인 안됨 등) → 인증 화면
    console.log('📍 [ROUTING] → (auth) - 로그인 필요');
    return '(auth)';
  };

  // 라우팅 로직: 온보딩, 마이데이터 연결, 로그인 상태에 따라 다른 화면으로 이동
  const initialRoute = getInitialRoute();
  
  console.log('✅ [ROUTING] 최종 라우팅 결정:', initialRoute);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(mydata)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            <Stack.Screen name="(slotDivide)" options={{ headerShown: false }} />
            {/* 공통 컴포넌트 테스트
            <Stack.Screen name="(dev)" options={{ headerShown: false }} /> */}
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}