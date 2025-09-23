/**
 * @file app/index.tsx
 * @description 앱의 루트 인덱스 파일 - 온보딩 상태에 따라 적절한 화면으로 리다이렉트
 */

import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { appService } from '@/src/services/appService';

export default function RootIndex() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      console.log('🔍 [INDEX] 온보딩 상태 조회 시작');
      const completed = await appService.getOnboardingCompleted();
      console.log('🔍 [INDEX] 온보딩 상태 조회 결과:', completed);
      setOnboardingDone(completed);
    })();
  }, []);


  // 온보딩 상태를 확인하는 동안 로딩 표시
  if (onboardingDone === null) {
    return null;
  }

  // 온보딩 완료 여부에 따라 적절한 화면으로 리다이렉트
  if (onboardingDone) {
    console.log('✅ [INDEX] 온보딩 완료 → 대시보드로 이동');
    return <Redirect href="/(tabs)/dashboard" />;
  } else {
    console.log('📱 [INDEX] 온보딩 미완료 → 온보딩 화면으로 이동');
    return <Redirect href="/(onboarding)/onboarding" />;
  }
}