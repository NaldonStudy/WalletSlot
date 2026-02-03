// /app/(auth)/(login)/index.tsx

import { authApi } from '@/src/api/auth';
import { AuthKeypad, PinDots } from '@/src/components';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { saveAccessToken } from '@/src/services/tokenService';
import { useAuthStore } from '@/src/store/authStore';
import { useLocalUserStore } from '@/src/store/localUserStore';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginPinScreen() {
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || '';
  const { setUser } = useLocalUserStore();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isComplete = pin.length === 6;

  useEffect(() => {
    // 이 화면은 전화번호가 확인된 사용자를 위한 것이므로,
    // 전화번호 정보가 없으면 이전 단계로 돌려보냅니다.
    if (!phone) {
      router.replace('/(auth)/(login)/login' as any);
    }
  }, [phone]);

  const onDigit = (d: string) => {
    if (pin.length < 6) {
      setError(''); // 다음 숫자 입력 시 에러 메시지 초기화
      setPin((p) => p + d);
    }
  };
  const onDelete = () => setPin((p) => p.slice(0, -1));
  const onClear = () => setPin('');

  const submit = async () => {
    if (!isComplete || !phone || loading) return;
    try {
      setLoading(true);
      setError('');

      const deviceId = await getOrCreateDeviceId();
      const resp = await authApi.loginFull({ phone, pin, deviceId } as any);
      
      if (!resp.success) {
        throw new Error(resp.error?.message || '로그인에 실패했습니다.');
      }

      await saveAccessToken(resp.data.accessToken);
        // 파싱된 resp를 Response-like 객체로 래핑하여 authStore.login에 전달
        // authService.saveLoginData now accepts parsed responses, so pass resp directly
        await useAuthStore.getState().login(resp);

        // 알림 동의 화면으로 이동
        router.replace({
          pathname: '/(auth)/(signup)/notification-consent',
          params: { from: 'login' }
        });

    } catch (e: any) {
      setError(e?.message || '로그인 중 오류가 발생했습니다.');
      // 실패 시 1초 후 PIN 자동 초기화
      setTimeout(() => {
        setPin('');
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isComplete) {
      submit();
    }
  }, [isComplete]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>PIN 입력</Text>
          <Text style={styles.subtitle}>
            {phone ? `전화번호 ${phone} 계정의\nPIN을 입력하세요.` : '전화번호 확인 중...'}
          </Text>

          <PinDots length={6} filled={pin.length} size="md" />

          <Text style={styles.errorText}>{loading ? '확인 중...' : error}</Text>
        </View>

        <View style={styles.keypadContainer}>
          <AuthKeypad
            onDigitPress={onDigit}
            onBackspace={onDelete}
            onClear={onClear}
            shuffle
            animation
            size="medium"
          />
        </View>
        <TouchableOpacity style={styles.forgotPinLink} onPress={() => router.push('/(auth)/(login)/forgot-password' as any)}>
          <Text style={styles.forgotPinText}>비밀번호를 잊어버리셨나요?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 48, lineHeight: 24 },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center', height: 20, marginTop: 24 },
  keypadContainer: { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#F3F4F6' },
  forgotPinLink: { paddingBottom: 32, paddingTop: 12, alignItems: 'center', backgroundColor: '#F3F4F6' },
  forgotPinText: { color: '#6B7280' },
});