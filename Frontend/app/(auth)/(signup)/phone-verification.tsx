import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

export default function PhoneVerificationScreen() {
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const purpose = (params.purpose as string) || 'DEVICE_VERIFY';

  // 상태 관리
  const [verificationId, setVerificationId] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 참조
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 계산된 값들
  const code = digits.join('');
  const canSubmit = code.length === 6 && (expiresIn ?? 0) > 0 && !isLoading;
  const canResend = cooldown === 0 && !isLoading;

  // 초기 SMS 발송 (화면 진입 시 자동 발송)
  useEffect(() => {
    if (phoneNumber) {
      sendSms();
    }
  }, [phoneNumber, purpose]);

  // 만료 타이머
  useEffect(() => {
    if (expiresIn === null || expiresIn <= 0) return;
    
    timerRef.current = setInterval(() => {
      setExpiresIn(prev => {
        if (prev === null || prev <= 1) {
          setError('인증코드가 만료되었습니다. 재전송해주세요.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [expiresIn]);

  // 재전송 쿨다운 타이머
  useEffect(() => {
    if (cooldown <= 0) return;
    
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    };
  }, [cooldown]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // SMS 발송 (Mock)
  const sendSms = async () => {
    if (!phoneNumber) {
      console.log('[SMS Screen] phoneNumber 없음');
      return;
    }
    
    console.log('[SMS Screen] SMS 발송 시작:', { phoneNumber, purpose });
    setIsLoading(true);
    setError('');
    
    try {
      // Mock SMS 발송 (나중에 API 연결)
      const mockVerificationId = `verif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const mockCode = String(Math.floor(100000 + Math.random() * 900000));
      const mockExpiresIn = 180; // 3분
      const mockResendAvailableIn = 30; // 30초
      
      console.log(`[MOCK][SMS] ${purpose} 인증코드 발송:`, { 
        phoneNumber, 
        code: mockCode, 
        verificationId: mockVerificationId,
        expiresIn: `${Math.floor(mockExpiresIn/60)}:${String(mockExpiresIn%60).padStart(2,'0')}`
      });
      
      // 상태 업데이트
      setVerificationId(mockVerificationId);
      setExpiresIn(mockExpiresIn);
      setCooldown(mockResendAvailableIn);
      setDigits(['', '', '', '', '', '']);
      setError('');
      
      console.log('[SMS Screen] 상태 업데이트 완료 - expiresIn:', mockExpiresIn);
    } catch (error: any) {
      console.error('[SMS Screen] SMS 발송 오류:', error);
      setError(error.message || 'SMS 발송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 재전송
  const handleResend = async () => {
    if (!canResend || !verificationId) {
      console.log('재전송 불가:', { canResend, verificationId, cooldown });
      return;
    }
    
    console.log('[SMS Screen] 재전송 시작');
    setIsLoading(true);
    setError('');
    
    try {
      // 실제 재전송 로직 호출
      await sendSms();
      
      // 첫 번째 입력칸에 포커스
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error: any) {
      console.error('재전송 오류:', error);
      setError(error.message || '재전송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 인증코드 검증
  const handleVerify = async () => {
    // 6자리 입력 확인
    if (code.length !== 6) {
      setError('인증코드 6자리를 모두 입력해주세요.');
      return;
    }
    
    // 만료 시간 확인
    if (expiresIn === null || expiresIn <= 0) {
      setError('인증코드가 만료되었습니다. 재전송해주세요.');
      return;
    }
    
    // 로딩 중 확인
    if (isLoading) return;
    
    // verificationId 확인
    if (!verificationId) {
      setError('인증 정보가 없습니다. 재전송해주세요.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('[SMS Screen] 인증 시도:', { verificationId, code });
      
      // Mock 인증 (나중에 API 연결)
      // 실제로는 서버에서 검증해야 함
      const mockVerified = true; // 항상 성공으로 처리
      
      if (mockVerified) {
        // 인증 성공 - 다음 단계로 이동
        Alert.alert('인증 완료', '휴대폰 인증이 완료되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              // TODO: 다음 단계로 네비게이션 (기기 인증 등)
              router.replace('/(tabs)/dashboard');
            }
          }
        ]);
      } else {
        setError('인증에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('[SMS Screen] 인증 오류:', error);
      setError(error.message || '인증 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 숫자 입력 처리
  const handleDigitChange = (index: number, value: string) => {
    const newDigits = [...digits];
    newDigits[index] = value.replace(/\D/g, ''); // 숫자만 허용
    setDigits(newDigits);
    setError(''); // 입력 시 에러 메시지 초기화

    // 다음 입력칸으로 자동 이동
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // 6자리 모두 입력되면 마지막 칸에서 포커스 해제
    if (value && index === 5) {
      inputRefs.current[index]?.blur();
    }
  };


  // 백스페이스 처리
  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      // 현재 칸이 비어있으면 이전 칸으로 이동
      inputRefs.current[index - 1]?.focus();
    }
  };


  // 시간 포맷팅
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 메인 콘텐츠 */}
        <View style={styles.content}>
          <Text style={styles.title}>인증 번호 6자리를 입력해주세요.</Text>
          
          {/* 인증 번호 라벨 */}
          <Text style={styles.label}>인증 번호</Text>
          
          {/* 6자리 입력칸 */}
          <View style={styles.digitContainer}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) => handleDigitChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.digitInput,
                  digit ? styles.digitInputFilled : null,
                  error ? styles.digitInputError : null
                ]}
                textAlign="center"
                selectTextOnFocus
                showSoftInputOnFocus={true}
              />
            ))}
          </View>

          {/* 타이머 및 재전송 */}
          <View style={styles.timerContainer}>
            <View style={styles.timerRow}>
              {expiresIn === null ? (
                <Text style={styles.timerText}>
                  인증코드를 발송 중입니다...
                </Text>
              ) : expiresIn > 0 ? (
                <Text style={styles.timerText}>
                  {formatTime(expiresIn)}
                </Text>
              ) : (
                <Text style={styles.timerText}>
                  인증코드가 만료되었습니다
                </Text>
              )}
              
              <TouchableOpacity
                onPress={handleResend}
                disabled={!canResend}
                style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
              >
                <Text style={[
                  styles.resendButtonText,
                  !canResend && styles.resendButtonTextDisabled
                ]}>
                  {cooldown > 0 ? `${cooldown}초 후 재전송` : '재전송'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 에러 메시지 */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* 확인 버튼 */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={!canSubmit}
            style={[styles.verifyButton, !canSubmit && styles.verifyButtonDisabled]}
          >
            <Text style={[
              styles.verifyButtonText,
              !canSubmit && styles.verifyButtonTextDisabled
            ]}>
              {isLoading ? '인증 중...' : '확인'}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  digitContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  digitInput: {
    width: 44,
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  digitInputFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  digitInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  timerContainer: {
    marginBottom: 24,
    width: '100%',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    marginRight: 8,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  resendButtonTextDisabled: {
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  verifyButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 70,
    marginBottom: 32,
    width: '100%',
  },
  verifyButtonDisabled: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
