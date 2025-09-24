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
import CustomSplashScreen from '@/src/components/CustomSplashScreen';
import { DEV_AUTH_BYPASS } from '@/src/config/devAuthBypass';
import { initializeMSW, isMSWEnabled } from '@/src/mocks';
import { appService } from '@/src/services/appService';
import { getOrCreateDeviceId, setDeviceId } from '@/src/services/deviceIdService';
import { getAccessToken, needsRefreshSoon, saveAccessToken, saveRefreshToken } from '@/src/services/tokenService';
import { unifiedPushService } from '@/src/services/unifiedPushService';
import { useAuthStore } from '@/src/store/authStore';
import { useLocalUserStore } from '@/src/store/localUserStore';

// 개발 환경에서 MSW(mock service worker) 활성화
if (__DEV__) {
  try {
    if (isMSWEnabled()) {
      initializeMSW();
    }
  } catch {}
}

// 리소스(폰트, 온보딩 상태)를 가져오는 동안 스플래시 화면을 유지합니다.
SplashScreen.preventAutoHideAsync();

/**
 * 앱의 루트 레이아웃 컴포넌트
 * - 폰트 로딩 및 온보딩 상태 관리
 * - 스플래시 화면 제어
 * - 기기 ID 초기화 및 인증 토큰 선제 갱신
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  // 인증 상태
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const authLoading = useAuthStore(state => state.isLoading);
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  // 온보딩 완료 여부: 직접 AsyncStorage에서 관리
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  // 스플래시 최소 표시 시간을 위한 상태
  const [splashMinTimeElapsed, setSplashMinTimeElapsed] = useState(false);
  // 커스텀 스플래시 화면 표시 여부
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  // Expo Router는 Error Boundary를 사용해 네비게이션 트리의 에러를 처리합니다.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // 앱 시작 시 1회: deviceId 초기화 및 온보딩 완료 여부를 비동기로 조회
  useEffect(() => {
    (async () => {
      try {
        const deviceId = await getOrCreateDeviceId();
        // 온보딩 완료 여부 조회
        const completed = await appService.getOnboardingCompleted();
        setOnboardingDone(completed);
        // 인증 상태 초기 확인
        await useAuthStore.getState().checkAuthStatus();

        // 개발용 로그인 바이패스
        if (DEV_AUTH_BYPASS.enabled) {
          try {
            // 디바이스 ID 강제 지정 (예: 서버에 등록된 1234와 맞추기 위함)
            if (DEV_AUTH_BYPASS.deviceIdOverride !== undefined && DEV_AUTH_BYPASS.deviceIdOverride !== null) {
              await setDeviceId(DEV_AUTH_BYPASS.deviceIdOverride as any);
            }
            // 토큰 저장
            await saveAccessToken(DEV_AUTH_BYPASS.tokens.accessToken);
            await saveRefreshToken(DEV_AUTH_BYPASS.tokens.refreshToken);
            // 온보딩 완료 처리
            await appService.setOnboardingCompleted(true);
            setOnboardingDone(true);
            // 로컬 사용자 세팅 (localUserStore)
            const setUser = useLocalUserStore.getState().setUser;
            await setUser({
              userName: DEV_AUTH_BYPASS.user.userName,
              isPushEnabled: DEV_AUTH_BYPASS.user.isPushEnabled,
              deviceId: (DEV_AUTH_BYPASS.deviceIdOverride as any) ?? deviceId,
            });

            // AuthService에도 LocalUser 저장하여 authStore가 로그인 상태로 인식
            const { authService } = await import('@/src/services/authService');
            await authService.saveUser({
              userName: DEV_AUTH_BYPASS.user.userName,
              isPushEnabled: DEV_AUTH_BYPASS.user.isPushEnabled,
              deviceId: (DEV_AUTH_BYPASS.deviceIdOverride as any) ?? deviceId,
            });

            // 인증 스토어 상태 강제 갱신
            await useAuthStore.getState().checkAuthStatus();
            // 푸시 등록 보장
            unifiedPushService
              .initialize()
              .then(() => firebasePushEnsure())
              .catch(() => {});
          } catch (e) {
            console.error('[DEV_AUTH_BYPASS] 초기화 실패:', e);
          }
        }
      } catch (error) {
        console.error('앱 초기화 중 오류:', error);
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
  
  // 앱 시작 시 기타 초기화 로직 + 선제 토큰 갱신
  useEffect(() => {
    // TODO: 실제 사용자 ID를 받아온 후 설정
    // monitoringService.setUserId('user_123');
    
    // 플랫폼별 알림 설정
    (async () => {
      try {
        const { setNotificationHandler } = await import('expo-notifications');
        // 포그라운드 알림 표시 방식 설정
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
          });
          await Notifications.setNotificationChannelAsync('firebase', {
            name: 'Firebase 푸시 알림',
            importance: Notifications.AndroidImportance.HIGH,
          });
          // Android 알림 채널 설정 완료
         }
        // 알림 핸들러 설정 완료
       } catch (error) {
        console.error('알림 설정 중 오류:', error);
       }
     })();
    
    // 푸시 서비스 자동 초기화 (온보딩 완료 후)
    if (onboardingDone) {
      unifiedPushService.initialize()
        .then(result => console.log('✅ 푸시 서비스 초기화 완료:', result))
        .catch(e => console.error('❌ 푸시 서비스 초기화 오류:', e));
    }

    // 선제 갱신: 앱 시작 시 1회 체크, 포그라운드 복귀 시마다 체크
    const maybeSilentRefresh = async () => {
      try {
        const at = await getAccessToken();
        if (!at) return;
        if (!needsRefreshSoon(at, 90)) return;
        await useAuthStore.getState().refreshAccessToken();
      } catch (e) {
        console.error('토큰 선제 갱신 실패:', e);
      }
    };

    maybeSilentRefresh();

    const { AppState } = require('react-native');
    const sub = AppState.addEventListener('change', (s: string) => {
      if (s === 'active') {
        maybeSilentRefresh();
      }
    });

    return () => {
      sub?.remove?.();
    };
  }, [onboardingDone]);

  // 푸시 서버 등록 보장 헬퍼
  const firebasePushEnsure = async () => {
    try {
      const { firebasePushService } = await import('@/src/services/firebasePushService');
      await firebasePushService.ensureServerRegistration();
    } catch {}
  };

  // 커스텀 스플래시 화면 표시
  if (showCustomSplash) {
    return <CustomSplashScreen />;
  }

  // 폰트 로딩, 온보딩 상태, 또는 인증 상태 확인 중일 때 스플래시 유지
  if (!loaded || onboardingDone === null || authLoading) {
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

  // 인증된 사용자는 항상 메인으로 이동
  const initialRoute = isLoggedIn ? '(tabs)' : getInitialRoute();

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