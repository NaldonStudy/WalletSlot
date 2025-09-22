import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSignupStore } from '@/src/store/signupStore';

// 금융기관 데이터
const banks = [
  { id: 'kookmin', name: '국민', image: require('@/src/assets/images/banks/국민은행.png'), format: '6-7' },
  { id: 'nonghyup', name: '농협', image: require('@/src/assets/images/banks/농협은행.png'), format: '3-4-4-2' },
  { id: 'shinhan', name: '신한', image: require('@/src/assets/images/banks/제주_신한은행.png'), format: '6-7' },
  { id: 'woori', name: '우리', image: require('@/src/assets/images/banks/우리은행.png'), format: '6-7' },
  { id: 'hana', name: '하나', image: require('@/src/assets/images/banks/하나은행.png'), format: '6-7' },
  { id: 'ibk', name: '기업', image: require('@/src/assets/images/banks/기업은행.png'), format: '3-4-4-2' },
  { id: 'industrial', name: '산업', image: require('@/src/assets/images/banks/산업은행.png'), format: '3-4-4-2' },
  { id: 'post', name: '우체국', image: require('@/src/assets/images/banks/싸피은행.png'), format: '3-4-4-2' },
  { id: 'citibank', name: '한국씨티', image: require('@/src/assets/images/banks/씨티은행.png'), format: '6-7' },
  { id: 'saemaul', name: '새마을', image: require('@/src/assets/images/banks/새마을은행.png'), format: '3-4-4-2' },
  { id: 'sc', name: 'SC제일', image: require('@/src/assets/images/banks/sc제일은행.png'), format: '6-7' },
  { id: 'daegu', name: '대구', image: require('@/src/assets/images/banks/대구은행.png'), format: '6-7' },
  { id: 'busan', name: '부산', image: require('@/src/assets/images/banks/경남은행.png'), format: '6-7' },
  { id: 'bnk', name: 'BNK 경남', image: require('@/src/assets/images/banks/경남은행.png'), format: '6-7' },
  { id: 'gwangju', name: '광주', image: require('@/src/assets/images/banks/광주_전북은행.png'), format: '6-7' },
  { id: 'jeonbuk', name: '전북', image: require('@/src/assets/images/banks/광주_전북은행.png'), format: '6-7' },
  { id: 'jeju', name: '제주', image: require('@/src/assets/images/banks/제주_신한은행.png'), format: '6-7' },
  { id: 'shinhyup', name: '신협', image: require('@/src/assets/images/banks/싸피은행.png'), format: '3-4-4-2' },
  { id: 'suhyup', name: '수협', image: require('@/src/assets/images/banks/싸피은행.png'), format: '3-4-4-2' },
  { id: 'kakao', name: '카카오뱅크', image: require('@/src/assets/images/banks/카카오뱅크.png'), format: '4-2-7' },
];

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
  const canSubmit = selectedBank && accountNumber.length >= 10;
  const selectedBankData = banks.find(bank => bank.id === selectedBank);

  // 계좌번호 포맷팅 함수
  const formatAccountNumber = (text: string, format: string): string => {
    const numbers = text.replace(/\D/g, ''); // 숫자만 추출
    
    if (format === '4-2-7') {
      // 카카오뱅크: 4-2-7
      if (numbers.length <= 4) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
      return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 13)}`;
    } else if (format === '6-7') {
      // 시중은행: 6-7
      if (numbers.length <= 6) return numbers;
      return `${numbers.slice(0, 6)}-${numbers.slice(6, 13)}`;
    } else if (format === '3-4-4-2') {
      // 특수은행: 3-4-4-2
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      if (numbers.length <= 11) return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}-${numbers.slice(11, 13)}`;
    }
    return numbers;
  };

  // 계좌번호 입력 처리
  const handleAccountNumberChange = (text: string) => {
    const numbers = text.replace(/\D/g, ''); // 숫자만 추출
    setAccountNumber(numbers); // 하이픈 없이 숫자만 저장
  };

  // 표시용 포맷된 계좌번호
  const displayAccountNumber = selectedBankData 
    ? formatAccountNumber(accountNumber, selectedBankData.format)
    : accountNumber;

  // 금융기관 선택
  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);
    setIsModalVisible(false);
  };

  // 계좌 인증 요청
  const handleAccountVerification = () => {
    if (!canSubmit) return;

    console.log('계좌 인증 요청:', {
      bank: selectedBankData?.name,
      accountNumber, // 하이픈 없는 숫자만 저장된 값
      displayFormat: selectedBankData?.format
    });

    // 계좌 인증 화면으로 이동
    router.push({
      pathname: '/(auth)/(signup)/account-verification' as any,
      params: {
        bankName: selectedBankData?.name || '',
        accountNumber: accountNumber,
        displayFormat: selectedBankData?.format || ''
      }
    });
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
                value={displayAccountNumber}
                onChangeText={handleAccountNumberChange}
                placeholder={selectedBankData ? `` : "계좌번호"}
                keyboardType="number-pad"
                style={styles.input}
                maxLength={20}
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
