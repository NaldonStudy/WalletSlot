import { useAuthStore } from '@/src/store/authStore';
import { Redirect, Stack, useSegments } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * 인증 페이지 그룹 레이아웃
 * - 로그인 상태인 경우 메인 탭으로 리다이렉트
 * - 로그인/회원가입 흐름 렌더링
 */
export default function AuthLayout(){
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
    const segments = useSegments();
    const last = segments[segments.length - 1];
  // 로그인 상태면 메인으로 이동
    if (isLoggedIn) {
        // 로그인 직후 알림 동의는 허용
        if (last === 'notification-consent') {
            return (
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                    <Stack screenOptions={{ headerShown: false }} />
                </SafeAreaView>
            );
        }
        return <Redirect href="/(tabs)/dashboard" />;
    }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <Stack initialRouteName="(login)"
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: {backgroundColor: '#fff'}

                }}
            />
        </SafeAreaView>
    )
}