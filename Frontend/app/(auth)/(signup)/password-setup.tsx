import { AuthKeypad } from '@/src/components';
import { useSignupStore } from '@/src/store/signupStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PasswordSetupScreen() {
  // 상태 관리
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [firstPin, setFirstPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // 스토어에서 PIN 저장 함수 가져오기
  const { setPin: savePin } = useSignupStore();
  
  const isPinComplete = pin.length === 6;
  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setError('');
    }
  };
  const handleDelete = () => setPin(prev => prev.slice(0, -1));
  const handleClear = () => setPin('');



  // PIN 설정 완료
  const handlePinComplete = async () => {
    if (!isPinComplete) return;

    if (!isConfirming) {
      // 첫 번째 PIN 입력 완료
      setFirstPin(pin);
      setIsConfirming(true);
      setPin(''); // PIN 초기화
      setError('');
    } else {
      // 두 번째 PIN 입력 완료 - 비교
      if (firstPin === pin) {
        // PIN 일치 - 스토어에 임시 저장 후 알림 동의 화면으로 이동
        if (__DEV__) {
          console.log('PIN 설정 완료');
        }
        savePin(pin); // 스토어에 PIN 저장
        
        // 알림 동의 화면으로 이동
        router.push('/(auth)/(signup)/notification-consent');
      } else {
        // PIN 불일치 - 완전 초기화
        setError('PIN이 일치하지 않습니다. 새롭게 다시 설정해주세요.');
        setPin(''); // 현재 PIN 초기화
        setIsConfirming(false); // 첫 번째 입력 단계로 돌아감
        setFirstPin(''); // 첫 번째 PIN도 초기화
        setIsLoading(false); // 로딩 상태 해제
  // 셔플은 공용 컴포넌트 설정으로 처리
      }
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 메인 콘텐츠 */}
        <View style={styles.content}>
          <Text style={styles.title}>Wallet Slot을 안전하게 잠글</Text>
          <Text style={styles.subtitle}>
            {isConfirming ? '확인을 위해 한 번 더 입력해주세요.' : 'PIN 6자리를 입력해주세요.'}
          </Text>

          {/* PIN 입력 표시 */}
          <View style={styles.pinContainer}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.pinDot,
                  index < pin.length ? styles.pinDotFilled : styles.pinDotEmpty
                ]} 
              />
            ))}
          </View>

          {/* 에러 메시지 */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </View>

        <View style={styles.keypadContainer}>
          <AuthKeypad
            onDigitPress={handleDigit}
            onBackspace={handleDelete}
            onClear={handleClear}
            shuffle
            fakeTouch
            animation
            size="medium"
          />
        </View>

        {isPinComplete && (
          <View style={styles.completeButtonContainer}>
            <TouchableOpacity style={styles.completeButton} onPress={handlePinComplete} disabled={isLoading}>
              <Text style={styles.completeButtonText}>{isLoading ? '설정 중...' : '완료'}</Text>
            </TouchableOpacity>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 48,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 48,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  pinDotEmpty: {
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
  },
  keypadContainer: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  completeButtonContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  completeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
