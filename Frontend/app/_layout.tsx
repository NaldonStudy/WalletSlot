// ✅ 1. 폴리필을 다른 어떤 코드보다 먼저 import 합니다.
import '@/src/polyfills';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { queryClient } from '@/src/api/queryClient';
// ✅ 2. 우리가 만든 initializeMSW 함수를 import 합니다.
import { initializeMSW } from '@/src/mocks';
// import { monitoringService } from '@/src/services';

// ✅ 3. 개발 모드에서만 MSW를 초기화합니다.
if (__DEV__) {
  initializeMSW();
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // ... (다른 폰트 추가 가능)
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  
  // 앱 시작 시 초기화 로직 (MSW 관련 로직은 상단으로 이동하여 통합)
  useEffect(() => {
    // TODO: 실제 사용자 ID를 받아온 후 설정
    // monitoringService.setUserId('user_123');
  }, []);
  
  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}