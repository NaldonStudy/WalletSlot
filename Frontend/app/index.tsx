/**
 * @file app/index.tsx
 * @description 앱의 루트 인덱스 파일 - 온보딩 상태에 따라 적절한 화면으로 리다이렉트
 */

import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { settingsUtils } from '@/src/store';

export default function RootIndex() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const done = await settingsUtils.getOnboardingCompleted();
      setOnboardingDone(done);
    })();
  }, []);

  // 온보딩 상태를 확인하는 동안 로딩 표시
  if (onboardingDone === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 온보딩 완료 여부에 따라 적절한 화면으로 리다이렉트
  if (onboardingDone) {
    return <Redirect href="/(tabs)/dashboard" />;
  } else {
    return <Redirect href="/(onboarding)/onboarding" />;
  }
}