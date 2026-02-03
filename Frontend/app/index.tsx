/**
 * @file app/index.tsx
 * @description 앱의 루트 인덱스 파일 - 온보딩 상태에 따라 적절한 화면으로 리다이렉트
 */

import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import React from 'react';

import { appService } from '@/src/services/appService';
import { getAccessToken } from '@/src/services/tokenService';

export default function RootIndex() {
  const { data: onboardingDone, isLoading: onboardingLoading } = useQuery<boolean>({
    queryKey: ['onboarding'],
    queryFn: () => appService.getOnboardingCompleted(),
    staleTime: Infinity,
  });
  const { data: accessToken, isLoading: tokenLoading } = useQuery<string | null>({
    queryKey: ['accessToken'],
    queryFn: () => getAccessToken(),
    staleTime: Infinity,
  });

  if (onboardingLoading || tokenLoading || onboardingDone === undefined) {
    return null;
  }

  // 가드 정책
  // - 온보딩 N -> 온보딩
  // - 온보딩 Y -> 토큰 N -> 회원가입 시작
  // - 온보딩 Y -> 토큰 Y -> 대시보드
  if (!onboardingDone) {
    return <Redirect href="/(onboarding)/onboarding" />;
  }
  if (!accessToken) {
    return <Redirect href="/(auth)/(signup)/name" />;
  }
  return <Redirect href="/(tabs)/dashboard" />;
}