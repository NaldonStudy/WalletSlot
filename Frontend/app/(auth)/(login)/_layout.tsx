import { useAuthStore } from '@/src/store/authStore';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

/**
 * 로그인 페이지 그룹 레이아웃
 * - 로그인 상태인 경우 메인 대시보드로 리다이렉트
 * - 로그인 스크린 렌더링
 */
export default function LoginLayout() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  if (isLoggedIn) {
    return <Redirect href="/(tabs)/dashboard" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}


