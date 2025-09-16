import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { queryClient } from '@/src/api/queryClient';
import { settingsUtils } from '@/src/store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  // 온보딩 완료 여부: null은 아직 로딩 중을 의미
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    // 앱 시작 시 1회: 온보딩 완료 여부를 비동기로 조회
    (async () => {
      const done = await settingsUtils.getOnboardingCompleted();
      setOnboardingDone(done);
    })();
  }, []);

  if (!loaded || onboardingDone === null) {
    // 폰트 또는 온보딩 플래그가 아직 준비되지 않음 → 일시적으로 렌더링 지연
    return null;
  }

  if (!onboardingDone) {
    // 온보딩 미완료 시 온보딩 스택으로 리다이렉트
    return <Redirect href="/(onboarding)" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* 🚩 루트 스택의 초기 라우트를 명시하고 싶다면 아래처럼 사용합니다.*/}
        <Stack initialRouteName="(tabs)/dashboard">
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* 공통 컴포넌트 테스트
          <Stack.Screen name="(dev)" options={{ headerShown: false }} /> */}
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
