import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { queryClient } from '@/src/api/queryClient';
import { initializeMSW } from '@/src/mocks';
import { monitoringService } from '@/src/services';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 앱 시작 시 초기화
  useEffect(() => {
    const initializeApp = async () => {
      // MSW 초기화 (개발 환경에서만)
      await initializeMSW({
        enabled: __DEV__,
        logging: true,
        delay: 0 // 응답 지연 없음
      });
      
      // TODO: 실제 사용자 ID를 받아온 후 설정
      // monitoringService.setUserId('user_123');
      
      // 앱 시작 이벤트 로깅
      monitoringService.logUserInteraction('navigation', {
        screen: 'app_root',
        colorScheme,
        timestamp: new Date().toISOString()
      });
    };

    initializeApp();
    
    // 앱 종료 시 정리 작업
    return () => {
      monitoringService.cleanup();
    };
  }, [colorScheme]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* 공통 컴포넌트 테스트
            <Stack.Screen name="(dev)" options={{ headerShown: false }} /> */}
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
