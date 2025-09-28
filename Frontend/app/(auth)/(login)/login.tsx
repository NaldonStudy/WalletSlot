//app/(auth)/(login)/login.tsx

import { authApi } from '@/src/api/auth';
import { AuthKeypad, PinDots } from '@/src/components';
import { featureFlags } from '@/src/config/featureFlags';
import { appService } from '@/src/services/appService';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { useAuthStore } from '@/src/store/authStore';
import { useLocalUserStore } from '@/src/store/localUserStore';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Step = 'phone' | 'sms' | 'pin';

export default function LoginScreen() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('010-');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // SMS 단계 상태
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const code = digits.join('');

  const { setUser } = useLocalUserStore();

  const plainPhone = phone.replace(/[^0-9]/g, '');
  const canGoNextPhone = plainPhone.length === 11;
  const isPinComplete = pin.length === 6;

  // 전화번호 입력 처리
  const handlePhoneChange = (text: string) => {
    if (!text.startsWith('010-')) {
      setPhone('010-');
      return;
    }
    const numbers = text.replace(/[^0-9]/g, '');
    if (numbers.length <= 11 && numbers.startsWith('010')) {
      let formatted = '010-';
      if (numbers.length > 3) formatted += numbers.slice(3, 7);
      if (numbers.length > 7) formatted += '-' + numbers.slice(7, 11);
      setPhone(formatted);
    }
  };

  // 1) SMS 인증 시작
  const startSms = async () => {
    if (!canGoNextPhone || loading) return;
    try {
      setLoading(true);
      setError('');
      const deviceId = await getOrCreateDeviceId();
      await authApi.sendSms({ phone: plainPhone, purpose: 'LOGIN', deviceId });
      setDigits(['', '', '', '', '', '']);
      setStep('sms');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (e: any) {
      Alert.alert('오류', e?.message || '인증번호 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 2) 인증코드 입력/검증
  const handleDigitChange = (index: number, value: string) => {
    const next = [...digits];
    next[index] = value.replace(/\D/g, '');
    setDigits(next);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const verifySms = async () => {
    if (code.length !== 6 || loading) return;
    try {
      setLoading(true);
      setError('');
      const res = await authApi.verifySms({ phone: plainPhone, purpose: 'LOGIN', code });
      if (!res.success || res.data?.verified === false) throw new Error(res.error?.message || '인증 실패');
      setStep('pin');
      setPin(''); // PIN 입력 단계 진입 시 초기화
    } catch (e: any) {
      Alert.alert('오류', e?.message || '인증에 실패했습니다. 코드를 확인해주세요.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const onDigitFromKeypad = (d: string) => {
    if (pin.length < 6) {
      setError(''); // 에러 메시지가 있을 경우, 다음 숫자 입력 시 지움
      setPin((p) => p + d);
    }
  };
  const onBackspace = () => setPin((p) => p.slice(0, -1));
  const onClear = () => setPin('');

  const submitPin = async () => {
    if (!isPinComplete || loading) return;
    try {
      setLoading(true);
      setError('');
      const deviceId = await getOrCreateDeviceId();
      const body = { phone: plainPhone, pin, deviceId };
      const resp = await authApi.loginFull(body as any);

      if (!resp.success) {
        throw new Error(resp.error?.message || 'PIN이 올바르지 않거나 등록되지 않은 사용자입니다.');
      }

      // 로그인 완료 처리
      await useAuthStore.getState().login(resp);

      // 온보딩 완료 처리 (로그인 성공 시)
      try {
        await appService.setOnboardingCompleted(true);
        featureFlags.setOnboardingEnabled(true);
        console.log('✅ 로그인 성공 - 온보딩 완료 처리됨');
      } catch (error) {
        console.error('⚠️ 로그인 성공 - 온보딩 완료 처리 실패:', error);
      }


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
    if (step === 'pin' && isPinComplete) {
      submitPin();
    }
  }, [pin, step, isPinComplete]);

  // SMS 코드 6자리가 모두 입력되면 자동으로 제출
  useEffect(() => {
    if (step === 'sms' && code.length === 6) {
      verifySms();
    }
  }, [code, step]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {step === 'phone' && (
          <View style={styles.section}>
            <Text style={styles.title}>휴대폰 번호로 로그인</Text>
            <Text style={styles.label}>휴대폰 번호</Text>
            <TextInput
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="010-1234-5678"
              keyboardType="phone-pad"
              maxLength={13}
              style={styles.input}
            />
            <TouchableOpacity style={[styles.primaryBtn, !canGoNextPhone && styles.disabled]} disabled={!canGoNextPhone || loading} onPress={startSms}>
              <Text style={[styles.primaryText, !canGoNextPhone && styles.disabledText]}>{loading ? '전송 중...' : '인증번호 받기'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'sms' && (
          <View style={styles.section}>
            <Text style={styles.title}>인증번호 6자리를 입력하세요</Text>
            <View style={styles.codeRow}>
              {digits.map((d, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { inputRefs.current[i] = r; }}
                  value={d}
                  onChangeText={(v) => handleDigitChange(i, v)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={styles.codeBox}
                  textAlign="center"
                />
              ))}
            </View>
            <TouchableOpacity style={[styles.primaryBtn, code.length !== 6 && styles.disabled]} disabled={code.length !== 6 || loading} onPress={verifySms}>
              <Text style={[styles.primaryText, code.length !== 6 && styles.disabledText]}>{loading ? '확인 중...' : '확인'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'pin' && (
          <View style={styles.pinSection}>
            <View style={styles.pinContent}>
              <Text style={styles.title}>PIN 입력</Text>
              <Text style={styles.subtitle}>
                {`전화번호 ${phone} 계정의\nPIN 6자리를 입력해주세요.`}
              </Text>

              <PinDots length={6} filled={pin.length} size="md" />

              <Text style={styles.errorText}>{loading ? '확인 중...' : error}</Text>
            </View>

            <View style={styles.keypadContainer}>
              <AuthKeypad
                onDigitPress={onDigitFromKeypad}
                onBackspace={onBackspace}
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
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  section: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 48, lineHeight: 24 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderColor: '#94A3B8', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, backgroundColor: '#FFFFFF' },
  primaryBtn: { backgroundColor: '#3B82F6', borderRadius: 8, marginTop: 20, paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  disabled: { backgroundColor: '#E5E7EB' },
  disabledText: { color: '#9CA3AF' },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 24 },
  codeBox: { width: 44, height: 56, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, backgroundColor: '#FFFFFF', fontSize: 22 },
  pinSection: { flex: 1, backgroundColor: '#F3F4F6' },
  pinContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  errorText: { fontSize: 14, color: '#EF4444', textAlign: 'center', height: 20, marginTop: 24 },
  keypadContainer: { paddingVertical: 10, paddingHorizontal: 24, backgroundColor: '#F3F4F6' },
  forgotPinLink: { paddingBottom: 32, paddingTop: 12, alignItems: 'center', backgroundColor: '#F3F4F6' },
  forgotPinText: { color: '#6B7280' },
});