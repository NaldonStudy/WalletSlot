import { authApi } from '@/src/api/auth';
import { AuthKeypad, PinDots } from '@/src/components';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { saveAccessToken, saveRefreshToken } from '@/src/services/tokenService';
import { unifiedPushService } from '@/src/services/unifiedPushService';
import { useAuthStore } from '@/src/store/authStore';
import { useLocalUserStore } from '@/src/store/localUserStore';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginPinScreen() {
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || '';
  const { setUser } = useLocalUserStore();
  const [pin, setPin] = useState('');
  const isComplete = pin.length === 6;

  useEffect(() => {
    if (!phone) {
      router.replace('/(auth)/(login)/login' as any);
    }
  }, [phone]);

  const onDigit = (d: string) => {
    if (pin.length < 6) setPin((p) => p + d);
  };
  const onDelete = () => setPin((p) => p.slice(0, -1));
  const onClear = () => setPin('');

  const submit = async () => {
    if (!isComplete || !phone) return;
    try {
      const deviceId = await getOrCreateDeviceId();
      const resp = await authApi.loginFull({ phone, pin, deviceId } as any);
      if (!resp.success) throw new Error(resp.error?.message || '로그인 실패');

      await saveAccessToken(resp.data.accessToken);
      await saveRefreshToken(resp.data.refreshToken);

      await setUser({
        userId: resp.data.user?.userId,
        userName: resp.data.user?.name || '사용자',
        isPushEnabled: !!resp.data.user?.isPushEnabled,
        deviceId,
      } as any);

  try { await useAuthStore.getState().checkAuthStatus(); } catch {}

  try { await unifiedPushService.initialize(); } catch {}
  try { await (await import('@/src/services/firebasePushService')).firebasePushService.ensureServerRegistration(); } catch {}

      router.replace('/(auth)/(signup)/notification-consent?from=login' as any);
    } catch (e: any) {
      Alert.alert('로그인 실패', e?.message || '로그인 중 오류가 발생했습니다.');
      setPin('');
    }
  };

  useEffect(() => {
    if (isComplete) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.sectionInner}>
          <Text style={styles.title}>PIN 입력</Text>
          <Text style={styles.subtitle}>{phone ? `전화번호 ${phone} 계정 PIN을 입력하세요` : '전화번호 확인 중...'}</Text>

          <PinDots length={6} filled={pin.length} size="md" />

          <AuthKeypad
            onDigitPress={onDigit}
            onBackspace={onDelete}
            onClear={onClear}
            shuffle
            fakeTouch
            animation
            size="medium"
          />

          <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => router.push('/(auth)/(login)/forgot-password' as any)}>
            <Text style={{ color: '#6B7280' }}>비밀번호를 잊어버리셨나요?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  sectionInner: { flex: 1, paddingHorizontal: 24, paddingTop: 64, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#6B7280', textAlign: 'center' },
  pinDots: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 24, marginBottom: 16 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  dotEmpty: { borderColor: '#D1D5DB', backgroundColor: 'transparent' },
  dotFilled: { borderColor: '#3B82F6', backgroundColor: '#3B82F6' },
});


