import { authApi } from '@/src/api/auth';
import { BANK_CODES } from '@/src/constants/banks';
import { useSignupStore } from '@/src/store/signupStore';
import type { AccountVerificationRequestRequest } from '@/src/types';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
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

// 계좌번호 자릿수 범위 (모든 은행 공통)
const ACCOUNT_LENGTH_RANGE = { min: 10, max: 20 }; // 10-20자리 범위로 유연하게 설정

// BANK_CODES에서 banks 배열 생성
const banks = Object.entries(BANK_CODES).map(([id, bank]) => ({
  id,
  name: bank.shortName,
  image: bank.logo,
}));

export default function AccountSelectionScreen() {
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { name } = useSignupStore();

  // 애니메이션 값들
  const fieldOpacity = useState(new Animated.Value(0))[0];
  const fieldTranslateY = useState(new Animated.Value(50))[0];

  // 컴포넌트 마운트 시 애니메이션 실행
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fieldOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fieldTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 계산된 값들
  const canSubmit = selectedBank && 
    accountNumber.length >= ACCOUNT_LENGTH_RANGE.min && 
    accountNumber.length <= ACCOUNT_LENGTH_RANGE.max;
  const selectedBankData = banks.find(bank => bank.id === selectedBank);

  // 계좌번호 입력 처리 (숫자만 입력받음)
  const handleAccountNumberChange = (text: string) => {
    const numbers = text.replace(/\D/g, ''); // 숫자만 추출
    if (numbers.length <= ACCOUNT_LENGTH_RANGE.max) {
      setAccountNumber(numbers);
    }
  };

  // 금융기관 선택
  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setIsModalVisible(false);
  };

  // 계좌 인증 요청
  const handleAccountVerification = async () => {
    if (!canSubmit) return;

    console.log('[Account Selection] 1원 인증 요청 시작:', {
      bank: selectedBankData?.name,
      accountNumber, // 숫자만 저장된 값
      accountLength: accountNumber.length
    });

    try {
      // 1원 인증 요청 API 호출
      const requestData: AccountVerificationRequestRequest = {
        bankId: selectedBank, // 은행 ID
        accountNo: accountNumber, // 계좌번호
        userName: name || '사용자' // 사용자 이름 (기본값 처리)
      };

      console.log('[Account Selection] API 요청 데이터:', requestData);
      const response = await authApi.requestAccountVerification(requestData);
      
      console.log('[Account Selection] API 응답:', response);

      if (response.success) {
        console.log('[Account Selection] 1원 인증 요청 성공, authIdentifier:', response.data.authIdentifier);
        console.log('[Account Selection] 선택된 은행 데이터:', {
          selectedBankData,
          bankName: selectedBankData?.name,
          bankShortName: selectedBankData?.shortName,
          selectedBank
        });
        console.log('[Account Selection] 전달할 bankName:', selectedBankData?.name);
        
        // 계좌 인증 화면으로 이동 (계좌 정보는 URL 파라미터로만 전달)
            router.push({
              pathname: '/(auth)/(signup)/account-verification' as any,
              params: {
                bankName: selectedBankData?.name || '', // 은행의 전체 이름 (예: "국민은행")
                accountNumber: accountNumber,
                bankId: selectedBank,
                pin: response.data.authIdentifier // 백엔드에서 받은 4자리 인증번호 식별자
              }
            });
      } else {
        throw new Error((response as any).message || (response as any).error?.message || '1원 인증 요청에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('[Account Selection] 1원 인증 요청 오류:', error);
      Alert.alert('인증 요청 실패', error.message || '1원 인증 요청 중 오류가 발생했습니다.');
    }
  };

  // 금융기관 아이템 렌더링
  const renderBankItem = ({ item }: { item: typeof banks[0] }) => (
    <TouchableOpacity
      style={styles.bankItem}
      onPress={() => handleBankSelect(item.id)}
    >
      <Image source={item.image} style={styles.bankLogo} resizeMode="contain" />
      <Text style={styles.bankName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            {name || '사용자'}님 명의의 금융기관 계좌를 인증해주세요.
          </Text>

          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                opacity: fieldOpacity,
                transform: [{ translateY: fieldTranslateY }],
              },
            ]}
          >
            {/* 금융기관 선택 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>금융기관</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setIsModalVisible(true)}
              >
                <Text style={[
                  styles.dropdownText,
                  selectedBank ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder
                ]}>
                  {selectedBankData ? selectedBankData.name : '금융기관'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* 계좌번호 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>계좌번호</Text>
              <TextInput
                value={accountNumber}
                onChangeText={handleAccountNumberChange}
                placeholder={selectedBankData ? `` : "계좌번호"}
                keyboardType="number-pad"
                style={styles.input}
                maxLength={ACCOUNT_LENGTH_RANGE.max}
                returnKeyType="done"
              />
            </View>
          </Animated.View>

          {/* 계좌 인증 요청 버튼 */}
          <TouchableOpacity
            onPress={handleAccountVerification}
            disabled={!canSubmit}
            style={[
              styles.submitButton,
              canSubmit ? styles.submitButtonActive : styles.submitButtonDisabled
            ]}
          >
            <Text style={[
              styles.submitButtonText,
              canSubmit ? styles.submitButtonTextActive : styles.submitButtonTextDisabled
            ]}>
              계좌 인증 요청하기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 금융기관 선택 모달 */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>금융기관</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={banks}
              renderItem={renderBankItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.bankList}
              showsVerticalScrollIndicator={false}
            />
          </SafeAreaView>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    color: '#111827',
    lineHeight: 28,
  },
  fieldBlock: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  dropdownButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  dropdownTextSelected: {
    color: '#111827',
  },
  dropdownTextPlaceholder: {
    color: '#9CA3AF',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 32,
  },
  submitButtonActive: {
    backgroundColor: '#3B82F6',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextActive: {
    color: '#FFFFFF',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
  // 모달 스타일
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  bankList: {
    padding: 20,
  },
  bankItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bankLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  bankName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
});
