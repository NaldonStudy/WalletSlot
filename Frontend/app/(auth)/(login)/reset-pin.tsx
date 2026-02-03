import { authApi } from '@/src/api/auth';
import { AuthKeypad, PinDots } from '@/src/components';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ResetPinScreen() {
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const resetCode = params.resetCode as string | undefined;

  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => pin.length === 6 && confirm.length === 6 && pin === confirm, [pin, confirm]);
  const isConfirming = pin.length === 6;

  useEffect(() => {
    if (!resetCode) return;
  }, [resetCode]);

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      if (!resetCode) {
        throw new Error('재설정 코드가 없습니다. 처음부터 다시 시도해주세요.');
      }
      const resp = await authApi.resetPin({ phone: phoneNumber, resetCode, newPin: pin });
      if (!resp.success) throw new Error(resp.error?.message || 'PIN 재설정 실패');
      Alert.alert('완료', '새 PIN이 설정되었습니다. 로그인 화면으로 이동합니다.', [
        { text: '확인', onPress: () => router.replace('/(auth)/(login)/login' as any) },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e?.message || 'PIN 재설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 2단계 입력 관리: 첫 번째 6자리 완료 시 자동으로 확인 단계로 전환
  useEffect(() => {
    if (pin.length === 6 && confirm.length === 0) {
      // 대기 없이 바로 확인 단계 진입
    }
  }, [pin, confirm]);

  const handleDigit = (d: string) => {
    if (pin.length < 6) setPin((prev) => (prev + d).slice(0, 6));
    else if (confirm.length < 6) setConfirm((prev) => (prev + d).slice(0, 6));
  };
  const handleDelete = () => {
    if (confirm.length > 0) setConfirm((prev) => prev.slice(0, -1));
    else setPin((prev) => prev.slice(0, -1));
  };
  const handleClear = () => {
    if (confirm.length > 0) setConfirm('');
    else setPin('');
  };

  // 확인 단계에서 6자리 도달 시 자동 검증 및 제출
  useEffect(() => {
    if (confirm.length === 6) {
      if (confirm === pin) submit();
      else {
        Alert.alert('불일치', '두 PIN이 일치하지 않습니다. 다시 시도해주세요.', [
          { text: '확인', onPress: () => setConfirm('') },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.section}>
          <Text style={styles.title}>{isConfirming ? '새 PIN 확인' : '새 PIN 설정'}</Text>
          <Text style={styles.subtitle}>{isConfirming ? '한 번 더 입력해주세요' : '본인 인증이 완료되었습니다. 새 PIN 6자리를 입력하세요.'}</Text>
          <PinDots length={6} filled={isConfirming ? confirm.length : pin.length} size="md" />
          <AuthKeypad
            onDigitPress={handleDigit}
            onBackspace={handleDelete}
            onClear={handleClear}
            shuffle
            fakeTouch
            animation
            size="medium"
          />
          <View style={{ height: 12 }} />
          <Text style={styles.helper}>{loading ? '저장 중...' : (canSubmit ? '일치하면 자동으로 저장됩니다.' : isConfirming ? '동일한 6자리를 입력해주세요.' : '6자리를 입력하면 확인 단계로 이동합니다.')}</Text>
          {canSubmit && (
            <TouchableOpacity style={styles.primaryBtn} onPress={submit} disabled={loading}>
              <Text style={styles.primaryText}>{loading ? '저장 중...' : '완료'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  section: { flex: 1, paddingHorizontal: 24, paddingTop: 48, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#6B7280', textAlign: 'center' },
  helper: { textAlign: 'center', color: '#6B7280' },
  primaryBtn: { backgroundColor: '#3B82F6', borderRadius: 8, marginTop: 16, paddingVertical: 14, alignItems: 'center', alignSelf: 'stretch' },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
