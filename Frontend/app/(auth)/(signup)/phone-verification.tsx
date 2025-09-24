import { authApi } from '@/src/api/auth';
import { getOrCreateDeviceId } from '@/src/services/deviceIdService';
import { useSignupStore } from '@/src/store/signupStore';
import type { SmsSendRequest, SmsVerifyRequest, SmsVerifySignupRequest } from '@/src/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PhoneVerificationScreen() {
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const purpose = (params.purpose as string) || 'DEVICE_VERIFY';
  const mode = params.mode as string;

  // 상태 관리
  const [verificationId, setVerificationId] = useState<string>('');
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 스토어에서 signupTicket 관리 함수 가져오기
  const { setSignupTicket } = useSignupStore();

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

  // SMS 발송 (실제 API 호출)
  const sendSms = async () => {
    if (!phoneNumber) {
      console.log('[SMS Screen] phoneNumber 없음');
      return;
    }
    
    console.log('[SMS Screen] SMS 발송 시작:', { phoneNumber, purpose });
    setIsLoading(true);
    setError('');
    
    try {
      // 디바이스 ID 가져오기
      const deviceId = await getOrCreateDeviceId();
      
      // API 요청 데이터 구성 (FORGOT_PIN은 서버 명세상 PIN_RESET으로 매핑)
      const mappedPurpose = (purpose === 'FORGOT_PIN' ? 'PIN_RESET' : purpose) as 'LOGIN' | 'SIGNUP' | 'DEVICE_VERIFY' | 'PIN_RESET' | 'PROFILE_UPDATE';
      const requestData: SmsSendRequest = {
        phone: phoneNumber,
        purpose: mappedPurpose as any,
        deviceId: deviceId
      };
      
      console.log('[SMS Screen] API 요청 데이터:', requestData);
      
      // 실제 API 호출
      console.log('[SMS Screen] API 호출 시작...');
      let response: any;
      if (purpose === 'FORGOT_PIN') {
        try {
          response = await authApi.requestPinReset({ phone: phoneNumber });
          if (!response?.success || !(response as any).data?.sent) {
            // Fallback to generic sendSms with PIN_RESET for MSW/dev compatibility
            response = await authApi.sendSms({ ...requestData, purpose: 'PIN_RESET' } as any);
          }
        } catch (e) {
          // Fallback path on error
          response = await authApi.sendSms({ ...requestData, purpose: 'PIN_RESET' } as any);
        }
      } else {
        response = await authApi.sendSms(requestData);
      }
      
      // 응답 상세 로그
      console.log('[SMS Screen] API 응답 전체:', response);
      console.log('[SMS Screen] 응답 타입:', typeof response);
      console.log('[SMS Screen] success 값:', response.success);
      console.log('[SMS Screen] data 값:', response.data);
      console.log('[SMS Screen] error 값:', response.error);
      
  if (response.success && (response as any).data?.sent) {
        console.log('[SMS Screen] SMS 발송 성공');
        
        // 상태 업데이트 (실제 API에서는 만료시간을 서버에서 관리)
        const mockExpiresIn = 180; // 3분 (실제로는 서버에서 관리)
        const mockResendAvailableIn = 30; // 30초
        
        setVerificationId(`verif_${Date.now()}`); // 임시 ID
        setExpiresIn(mockExpiresIn);
        setCooldown(mockResendAvailableIn);
        setDigits(['', '', '', '', '', '']);
        setError('');
        
        console.log('[SMS Screen] 상태 업데이트 완료 - expiresIn:', mockExpiresIn);
      } else {
        console.error('[SMS Screen] SMS 발송 실패 - 응답:', response);
        throw new Error(response.error?.message || 'SMS 발송에 실패했습니다.');
      }
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

  // 인증코드 검증 (실제 API 호출)
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
      console.log('[SMS Screen] 인증 시도:', { phoneNumber, purpose, code });
      
  // 목적에 따라 다른 검증 엔드포인트 사용
  if (purpose === 'SIGNUP') {
        const requestData: SmsVerifySignupRequest = {
          phone: phoneNumber,
          purpose: 'SIGNUP',
          code,
        };
        const response = await authApi.verifySmsSignup(requestData);
        if (response.success && response.data.verified) {
          setSignupTicket(response.data.signupTicket);
          // TODO(1원 인증): 1원 인증 구현 시 아래 라우팅을 `/(auth)/(signup)/account-selection` 등 1원 인증 단계로 변경하세요.
          Alert.alert('인증 완료', '휴대폰 인증이 완료되었습니다.', [
            {
              text: '확인',
              onPress: () => router.push('/(auth)/(signup)/password-setup' as any),
            },
          ]);
        } else {
          setError(response.error?.message || '인증코드가 일치하지 않습니다. 다시 입력해주세요.');
        }
      } else if (purpose === 'FORGOT_PIN') {
        // 재설정은 verify를 호출하지 않고 코드 전달로 진행
        Alert.alert('인증 완료', '휴대폰 인증이 완료되었습니다.', [
          {
            text: '확인',
            onPress: () => router.replace({ pathname: '/(auth)/(login)/reset-pin', params: { phoneNumber, resetCode: code } } as any),
          },
        ]);
      } else {
        const requestData: SmsVerifyRequest = {
          phone: phoneNumber,
          // 명세 상: 'LOGIN' | 'DEVICE_VERIFY' | 'PIN_RESET' | 'SIGNUP'
          purpose: purpose === 'FORGOT_PIN' ? 'PIN_RESET' : (purpose as any),
          code,
        };
        const response = await authApi.verifySms(requestData);
        if (response.success && response.data.verified) {
          Alert.alert('인증 완료', '휴대폰 인증이 완료되었습니다.', [
            {
              text: '확인',
              onPress: () => {
                if (purpose === 'PROFILE_UPDATE' || mode === 'profile_update') {
                  router.push('/(tabs)/profile' as any);
                } else {
                  router.push('/(auth)/(signup)/account-selection' as any);
                }
              },
            },
          ]);
        } else {
          setError(response.error?.message || '인증코드가 일치하지 않습니다. 다시 입력해주세요.');
        }
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

    // 다음 입력칸으로 자동 이동 (마지막 칸이 아닐 때만)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // 6자리 모두 입력되면 마지막 칸에서 포커스 해제 (커서 사라짐)
    if (value && index === 5) {
      setTimeout(() => {
        inputRefs.current[index]?.blur();
      }, 100);
    }
  };

  // 입력칸 클릭 처리 (6자리 모두 입력된 후 수정 가능)
  const handleInputPress = (index: number) => {
    // 6자리 모두 입력된 상태에서 아무 칸이나 클릭하면 해당 칸에 포커스
    if (code.length === 6) {
      inputRefs.current[index]?.focus();
    }
  };


  // 백스페이스 처리
  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace') {
      if (digits[index]) {
        // 현재 칸에 값이 있으면 현재 칸만 지우기
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
        setError('');
      } else if (index > 0) {
        // 현재 칸이 비어있으면 이전 칸으로 이동하고 이전 칸도 지우기
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        setError('');
        
        // 이전 칸으로 포커스 이동
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 50);
      }
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
              <TouchableOpacity
                key={index}
                style={[
                  styles.digitInput,
                  digit ? styles.digitInputFilled : null,
                  error ? styles.digitInputError : null
                ]}
                onPress={() => handleInputPress(index)}
                activeOpacity={0.7}
              >
                <TextInput
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(value) => handleDigitChange(index, value)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={styles.digitInputText}
                  textAlign="center"
                  selectTextOnFocus
                  showSoftInputOnFocus={true}
                  pointerEvents="none" // TouchableOpacity가 터치를 처리하도록
                />
              </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitInputText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    width: '100%',
    height: '100%',
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
