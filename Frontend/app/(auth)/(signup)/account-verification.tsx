import { authApi } from '@/src/api/auth';
import { BANK_CODES } from '@/src/constants/banks';
import { useSignupStore } from '@/src/store/signupStore';
import type { AccountVerificationVerifyRequest } from '@/src/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function AccountVerificationScreen() {
  const params = useLocalSearchParams();
  const bankName = params.bankName as string; // 은행의 전체 이름 (예: "국민은행")
  const accountNumber = params.accountNumber as string;
  const bankId = params.bankId as string;
  const pin = params.pin as string; // 백엔드에서 받은 4자리 인증번호 식별자
  const { name } = useSignupStore();

  // 상태 관리
  const [verificationCode, setVerificationCode] = useState<string[]>(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(288); // 4분 48초
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState<boolean>(false);

  // 참조
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 계좌번호 표시용 포맷팅 (간단한 하이픈 추가)
  const formatAccountNumber = (accountNumber: string): string => {
    // 4자리씩 나누어 하이픈 추가 (마지막 그룹은 남은 자릿수)
    const groups = [];
    for (let i = 0; i < accountNumber.length; i += 4) {
      groups.push(accountNumber.slice(i, i + 4));
    }
    return groups.join('-');
  };

  // 타이머 시작
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setShowTimeoutModal(true);
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
  }, []);

  // 계산된 값들
  const code = verificationCode.join('');
  const canSubmit = code.length === 4 && timeLeft > 0 && !isLoading;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // 1원 입금 시뮬레이션 (실제로는 API 호출)
  useEffect(() => {
    console.log('[Account Verification] 1원 입금 시뮬레이션 시작:', {
      bankName,
      accountNumber: formatAccountNumber(accountNumber),
      pin: pin // 백엔드에서 받은 PIN
    });
    console.log('[Account Verification] 파라미터 상세:', {
      bankName: `"${bankName}"`,
      accountNumber: `"${accountNumber}"`,
      bankId: `"${bankId}"`,
      pin: `"${pin}"`
    });
    console.log('[Account Verification] 받은 bankName 값:', bankName);
  }, []);

  // 인증번호 입력 처리
  const handleCodeChange = (index: number, value: string) => {
    const newCode = [...verificationCode];
    newCode[index] = value.replace(/\D/g, ''); // 숫자만 허용
    setVerificationCode(newCode);

    // 다음 입력칸으로 자동 이동
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 백스페이스 처리
  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace') {
      if (verificationCode[index]) {
        // 현재 칸에 값이 있으면 현재 칸만 지우기
        const newCode = [...verificationCode];
        newCode[index] = '';
        setVerificationCode(newCode);
      } else if (index > 0) {
        // 현재 칸이 비어있으면 이전 칸으로 이동하고 이전 칸도 지우기
        const newCode = [...verificationCode];
        newCode[index - 1] = '';
        setVerificationCode(newCode);
        
        // 이전 칸으로 포커스 이동
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 50);
      }
    }
  };


  // 인증 확인
  const handleVerify = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    
    try {
      console.log('[Account Verification] 1원 인증 검증 시도:', { 
        code, 
        bankName, 
        accountNumber,
        bankId 
      });
      
      // 1원 인증 검증 API 호출
      // bankName이 제대로 전달되지 않은 경우 bankId로 찾기
      console.log('[Account Verification] bankId로 찾기:', {
        bankId,
        bankName,
        foundBank: BANK_CODES[bankId as keyof typeof BANK_CODES]
      });
      
      // bankId로 BANK_CODES에서 name을 강제로 찾기 (bankName이 shortName일 수 있음)
      const bankInfo = BANK_CODES[bankId as keyof typeof BANK_CODES];
      const actualBankName = bankInfo?.name || bankName || '은행';
      console.log('[Account Verification] actualBankName:', actualBankName);
      
      const authIdentifier = `${actualBankName} ${code}`; // 은행이름 + 공백 + 4자리 숫자 (예: "국민은행 2337")
      const requestData: AccountVerificationVerifyRequest = {
        accountNo: accountNumber,
        authIdentifier: authIdentifier, // 은행이름 + 공백 + 4자리 인증번호
        userName: name || '사용자' // 사용자 이름 (기본값 처리)
      };

      console.log('[Account Verification] API 요청 데이터:', requestData);
      console.log('[Account Verification] 요청 데이터 상세:', {
        accountNo: `"${accountNumber}" (길이: ${accountNumber.length})`,
        authIdentifier: `"${authIdentifier}" (길이: ${authIdentifier.length})`,
        bankName: `"${bankName}"`,
        actualBankName: `"${actualBankName}"`,
        userInputCode: `"${code}" (길이: ${code.length})`,
        userName: `"${name || '사용자'}"`
      });
      const response = await authApi.verifyAccountVerification(requestData);
      
      console.log('[Account Verification] API 응답:', response);
      console.log('[Account Verification] 응답 상세:', {
        success: response.success,
        message: (response as any).message,
        data: (response as any).data,
        error: (response as any).error
      });

      if (response.success) {
        console.log('[Account Verification] 1원 인증 검증 성공');
        
        Alert.alert('인증 완료', '계좌 인증이 완료되었습니다.', [
          {
            text: '확인',
            onPress: () => {
              router.push('/(auth)/(signup)/password-setup');
            }
          }
        ]);
      } else {
        throw new Error((response as any).message || (response as any).error?.message || '인증번호가 일치하지 않습니다.');
      }
    } catch (error: any) {
      console.error('[Account Verification] 1원 인증 검증 오류:', error);
      Alert.alert('인증 실패', error.message || '인증번호를 다시 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 시간 연장
  const handleTimeExtension = () => {
    setTimeLeft(288); // 4분 48초로 리셋
    Alert.alert('시간 연장', '인증 시간이 연장되었습니다.');
  };

  // 계좌 수정
  const handleAccountModification = () => {
    setShowAccountModal(true);
  };

  // 1원 다시 보내기
  const handleResendDeposit = () => {
    setShowTimeoutModal(false);
    setTimeLeft(288);
    setVerificationCode(['', '', '', '']);
    console.log('1원 입금 재시도');
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>해지</Text>
          </TouchableOpacity>
        </View>

        {/* 계좌 정보 */}
        <View style={styles.accountInfo}>
          <View style={styles.accountRow}>
            <Text style={styles.accountText}>
              {bankName} {formatAccountNumber(accountNumber)}
            </Text>
            <TouchableOpacity onPress={handleAccountModification}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.depositText}>위의 계좌로 1원을 입금했습니다.</Text>
        </View>

        {/* 안내 문구 */}
        <Text style={styles.instruction}>
          입금자명 뒤 숫자 4자리 인증번호를 확인 후 입력해주세요.
        </Text>

        {/* 입금자명 (마스킹된) */}
        <View style={styles.depositorSection}>
          <Text style={styles.label}>입금자명</Text>
          <View style={styles.depositorContainer}>
            <Text style={styles.depositorText}>기관명</Text>
            <View style={styles.maskedContainer}>
              {['*', '*', '*', '*'].map((char, index) => (
                <View key={index} style={styles.maskedBox}>
                  <Text style={styles.maskedText}>{char}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.depositorText}>1원</Text>
          </View>
        </View>

        {/* 인증번호 입력 */}
        <View style={styles.verificationSection}>
          <View style={styles.verificationHeader}>
            <Text style={styles.label}>인증 번호</Text>
            <TouchableOpacity onPress={handleTimeExtension}>
              <Text style={styles.timeExtensionText}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')} 시간연장
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.codeContainer}>
            {verificationCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                value={digit}
                onChangeText={(value) => handleCodeChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.codeInput,
                  digit ? styles.codeInputFilled : null
                ]}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>
        </View>

        {/* 확인 버튼 */}
        <TouchableOpacity
          onPress={handleVerify}
          disabled={!canSubmit}
          style={[
            styles.verifyButton,
            !canSubmit && styles.verifyButtonDisabled
          ]}
        >
          <Text style={[
            styles.verifyButtonText,
            !canSubmit && styles.verifyButtonTextDisabled
          ]}>
            {isLoading ? '인증 중...' : '확인'}
          </Text>
        </TouchableOpacity>


        {/* 계좌 수정 모달 */}
        <Modal
          visible={showAccountModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAccountModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>계좌 수정</Text>
              <Text style={styles.modalMessage}>
                같은 계좌로는 5분 이내에 재인증이 불가합니다. 다른 계좌로 인증을 진행해주세요.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton}
                  onPress={() => setShowAccountModal(false)}
                >
                  <Text style={styles.modalCancelText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalConfirmButton}
                  onPress={() => {
                    setShowAccountModal(false);
                    router.back();
                  }}
                >
                  <Text style={styles.modalConfirmText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 시간 초과 모달 */}
        <Modal
          visible={showTimeoutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTimeoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>입력 시간 초과</Text>
              <Text style={styles.modalMessage}>
                인증번호 입력시간이 초과되었습니다. 새로운 1원 입금 인증번호를 입력해주세요.
              </Text>
              <TouchableOpacity 
                style={styles.modalResendButton}
                onPress={handleResendDeposit}
              >
                <Text style={styles.modalResendText}>1원 다시 보내기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 16,
    paddingBottom: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 32,
  },
  accountInfo: {
    marginBottom: 24,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  editIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  depositText: {
    fontSize: 14,
    color: '#111827',
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  depositorSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  depositorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  depositorText: {
    fontSize: 16,
    color: '#111827',
  },
  maskedContainer: {
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  maskedBox: {
    width: 32,
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  maskedText: {
    fontSize: 18,
    color: '#6B7280',
  },
  verificationSection: {
    marginBottom: 32,
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeExtensionText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  codeInputFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
  },
  verifyButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 32,
  },
  verifyButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButtonTextDisabled: {
    color: '#9CA3AF',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  modalResendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalResendText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
