import { AuthKeypad } from '@/src/components';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthenticationPinScreen() {
  // 상태
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shuffleTrigger, setShuffleTrigger] = useState<number>(Math.random());

  const isPinComplete = pin.length === 6;

  // 입력 처리
  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };
  const handleBackspace = () => setPin(prev => prev.slice(0, -1));
  const handleClear = () => setPin('');

  const handleSubmit = async () => {
    if (!isPinComplete) return;
    setIsLoading(true);
    // 목업: 아무 6자리나 통과 → 다음 화면(또는 뒤로가기)
    setTimeout(() => {
      setIsLoading(false);
      router.back();
    }, 300);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={styles.title}>인증서</Text>
          <Text style={styles.subtitle}>PIN 6자리를 입력해주세요</Text>

          {/* PIN 표시 */}
          <View style={styles.pinContainer}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={index}
                style={[styles.pinDot, index < pin.length ? styles.pinDotFilled : styles.pinDotEmpty]}
              />
            ))}
          </View>
        </View>

        {/* 통합 키패드 */}
        <View style={styles.keypadContainer}>
          <AuthKeypad
            onDigitPress={handleDigit}
            onBackspace={handleBackspace}
            onClear={handleClear}
            shuffleTrigger={shuffleTrigger}
            fakeTouch={true}
            animation={true}
            size="medium"
          />
        </View>

        {/* 완료 버튼 */}
        {isPinComplete && (
          <View style={styles.completeButtonContainer}>
            <TouchableOpacity style={styles.completeButton} onPress={handleSubmit} disabled={isLoading}>
              <Text style={styles.completeButtonText}>{isLoading ? '확인 중...' : '확인'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 48 },
  pinContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 48 },
  pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  pinDotEmpty: { borderColor: '#D1D5DB', backgroundColor: 'transparent' },
  pinDotFilled: { borderColor: '#3B82F6', backgroundColor: '#3B82F6' },
  keypadContainer: { backgroundColor: '#F3F4F6', paddingVertical: 20, paddingHorizontal: 24 },
  completeButtonContainer: { paddingVertical: 20, paddingHorizontal: 24 },
  completeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
