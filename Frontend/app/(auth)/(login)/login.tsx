import { authApi } from '@/src/api/auth';
import { AuthKeypad, PinDots } from '@/src/components';
import { featureFlags } from '@/src/config/featureFlags';
import { appService } from '@/src/services/appService';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { saveAccessToken, saveRefreshToken } from '@/src/services/tokenService';
import { unifiedPushService } from '@/src/services/unifiedPushService';
import { useAuthStore } from '@/src/store/authStore';
import { useLocalUserStore } from '@/src/store/localUserStore';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
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
  // 로그인은 PIN 검증이므로 확인 단계 없음
  const [firstPin, setFirstPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // SMS 단계 상태
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const code = digits.join('');

  const { setUser } = useLocalUserStore();

  // 전화번호 입력 처리 (010-XXXX-XXXX 포맷)
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

  const plainPhone = phone.replace(/[^0-9]/g, '');
  const canGoNextPhone = plainPhone.length === 11;

  // 1) 전화번호 확인 → SMS 전송
  const startSms = async () => {
    if (!canGoNextPhone) return;
    try {
      setLoading(true);
      setError('');
      const deviceId = await getOrCreateDeviceId();
      await authApi.sendSms({ phone: plainPhone, purpose: 'LOGIN', deviceId });
      setDigits(['', '', '', '', '', '']);
      setStep('sms');
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
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
    if (code.length !== 6) return;
    try {
      setLoading(true);
      setError('');
      const res = await authApi.verifySms({ phone: plainPhone, purpose: 'LOGIN', code });
      if (!res.success || res.data?.verified === false) throw new Error(res.error?.message || '인증 실패');
      // 로그인용은 signupTicket 없이 바로 PIN 단계로 진행
      setStep('pin');
      setPin('');
      setIsConfirming(false);
      setFirstPin('');
    } catch (e: any) {
      Alert.alert('오류', e?.message || '인증 실패');
    } finally {
      setLoading(false);
    }
  };

  // 3) PIN 설정(로그인용 입력) → login/full 호출
  const isPinComplete = pin.length === 6;
  const onDigitFromKeypad = (d: string) => {
    if (pin.length < 6) setPin((p) => p + d);
  };
  const onBackspace = () => setPin((p) => p.slice(0, -1));
  const onClear = () => setPin('');

  const submitPin = async () => {
    if (!isPinComplete) return;
    try {
      setLoading(true);
      setError('');
      const deviceId = await getOrCreateDeviceId();
      const body = { phone: plainPhone, pin, deviceId };
      const resp = await authApi.loginFull(body as any);
      if (!resp.success) {
        const code = (resp as any).error?.code ?? (resp as any).errorCode ?? 'UNKNOWN';
        const msg = (resp as any).error?.message ?? (resp as any).message ?? '로그인 실패';
        if (code === 'DEVICE_ALREADY_REGISTERED' || code === 'HTTP_409' || /이미 등록된 기기/.test(msg)) {
          console.warn('[LOGIN] Device already registered:', { code, msg });
          Alert.alert('기기 등록 불가', `이미 등록된 기기입니다. 등록된 계정에서 먼저 디바이스 연동 해제 후 다시 시도해 주세요.\nCode: ${code || 'UNKNOWN'}`);
          return;
        }
        console.warn('[LOGIN] API error:', { code, msg });
        Alert.alert('로그인 실패', `${msg}\nCode: ${code || 'UNKNOWN'}`);
        return;
      }

      // 토큰 저장(보안 저장소)
      await saveAccessToken(resp.data.accessToken);
      await saveRefreshToken(resp.data.refreshToken);

      // 로컬 사용자 업데이트 (표시용)
      await setUser({
        userId: resp.data.user?.userId,
        userName: resp.data.user?.name || '사용자',
        isPushEnabled: false,
        deviceId,
      });

      // 글로벌 인증 스토어 동기화 (저장 후 상태 갱신)
      try {
        await useAuthStore.getState().checkAuthStatus();
      } catch {}

      // 온보딩 완료 처리 (로그인 성공 시)
      try {
        await appService.setOnboardingCompleted(true);
        featureFlags.setOnboardingEnabled(true);
        console.log('✅ 로그인 성공 - 온보딩 완료 처리됨');
      } catch (error) {
        console.error('⚠️ 로그인 성공 - 온보딩 완료 처리 실패:', error);
      }

    // 로그인 직후 푸시 초기화 및 토큰 등록(401 방지)
    try { await unifiedPushService.initialize(); } catch {}
    try { await (await import('@/src/services/firebasePushService')).firebasePushService.ensureServerRegistration(); } catch {}

    // 로그인 직후 알림 동의 화면으로 이동해 isPushEnabled 갱신
    router.replace('/(auth)/(signup)/notification-consent?from=login' as any);
    } catch (e: any) {
      const msg = e?.message || '로그인에 실패했습니다.';
      const code = e?.code || e?.response?.status || 'UNKNOWN';
      console.warn('[LOGIN] exception:', { code, msg, error: e });
      if (/이미 등록된 기기/.test(msg) || e?.code === 'DEVICE_ALREADY_REGISTERED' || e?.code === 'HTTP_409') {
        Alert.alert('기기 등록 불가', `이미 등록된 기기입니다. 등록된 계정에서 먼저 디바이스 연동 해제 후 다시 시도해 주세요.\nCode: ${code}`);
      } else {
        Alert.alert('로그인 실패', `${msg}\nCode: ${code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
            {!!error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={[styles.primaryBtn, code.length !== 6 && styles.disabled]} disabled={code.length !== 6 || loading} onPress={verifySms}>
              <Text style={[styles.primaryText, code.length !== 6 && styles.disabledText]}>{loading ? '확인 중...' : '확인'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'pin' && (
          <View style={styles.section}>
            <Text style={styles.title}>PIN 입력</Text>
            <Text style={styles.label}>6자리 PIN을 입력해주세요</Text>
            <PinDots length={6} filled={pin.length} size="md" />
            <AuthKeypad
              onDigitPress={onDigitFromKeypad}
              onBackspace={onBackspace}
              onClear={onClear}
              shuffle
              fakeTouch
              animation
              size="medium"
            />
            <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => router.push('/(auth)/(login)/forgot-password' as any)}>
              <Text style={{ color: '#6B7280' }}>비밀번호를 잊어버리셨나요?</Text>
            </TouchableOpacity>
            {isPinComplete && (
              <TouchableOpacity style={styles.primaryBtn} disabled={loading} onPress={submitPin}>
                <Text style={styles.primaryText}>{loading ? '확인 중...' : '완료'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  section: { flex: 1, paddingHorizontal: 24, paddingTop: 64 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderColor: '#94A3B8', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, backgroundColor: '#FFFFFF' },
  primaryBtn: { backgroundColor: '#3B82F6', borderRadius: 8, marginTop: 20, paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  disabled: { backgroundColor: '#E5E7EB' },
  disabledText: { color: '#9CA3AF' },
  error: { color: '#EF4444', textAlign: 'center', marginTop: 12 },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  codeBox: { width: 44, height: 56, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, backgroundColor: '#FFFFFF', fontSize: 22 },
  pinDots: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  dotEmpty: { borderColor: '#D1D5DB', backgroundColor: 'transparent' },
  dotFilled: { borderColor: '#3B82F6', backgroundColor: '#3B82F6' },
});


