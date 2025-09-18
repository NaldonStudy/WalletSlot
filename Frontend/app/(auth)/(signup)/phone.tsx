import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSignupStore } from '@/src/store/signupStore';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('010-');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { name, carrier, residentFront6, residentBack1, setPhone: setStorePhone, isPhoneValid } = useSignupStore();

  const carriers = ['SKT', 'KT', 'LG U+', '알뜰폰'];

  // 애니메이션 값들
  const residentIdFieldTranslateY = useState(new Animated.Value(0))[0];
  const nameFieldTranslateY = useState(new Animated.Value(0))[0];
  const phoneFieldOpacity = useState(new Animated.Value(0))[0];
  const phoneFieldTranslateY = useState(new Animated.Value(50))[0];
  
  // 드롭다운 열림/닫힘에 따른 애니메이션
  const dropdownOffset = useState(new Animated.Value(0))[0];

  // 컴포넌트 마운트 시 애니메이션 실행
  useEffect(() => {
    // 1단계: 주민등록번호와 이름 입력칸이 함께 아래로 슬라이드
    Animated.parallel([
      Animated.timing(residentIdFieldTranslateY, {
        toValue: 50,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(nameFieldTranslateY, {
        toValue: 50,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2단계: 휴대폰 번호 입력칸이 나타나면서 위로 슬라이드
      Animated.parallel([
        Animated.timing(phoneFieldOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(phoneFieldTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handlePhoneChange = (text: string) => {
    // 010-으로 시작하는지 확인
    if (!text.startsWith('010-')) {
      setPhone('010-');
      return;
    }

    // 숫자만 추출
    const numbers = text.replace(/[^0-9]/g, '');
    
    // 010으로 시작하는 11자리 숫자만 허용
    if (numbers.length <= 11 && numbers.startsWith('010')) {
      let formatted = '010-';
      
      if (numbers.length > 3) {
        formatted += numbers.slice(3, 7);
      }
      if (numbers.length > 7) {
        formatted += '-' + numbers.slice(7, 11);
      }
      
      setPhone(formatted);
      // 스토어에는 하이픈 없이 저장
      if (selectedCarrier) {
        setStorePhone(selectedCarrier as any, numbers);
      }
    }
  };

  const handleCarrierSelect = (carrier: string) => {
    setSelectedCarrier(carrier);
    setIsDropdownOpen(false);
    // 통신사 선택 시 스토어에 저장
    if (phone && phone !== '010-') {
      const numbers = phone.replace(/[^0-9]/g, '');
      setStorePhone(carrier as any, numbers);
    }
  };

  const toggleDropdown = () => {
    const newState = !isDropdownOpen;
    setIsDropdownOpen(newState);
    
    // 드롭다운 열림/닫힘에 따른 애니메이션
    Animated.timing(dropdownOffset, {
      toValue: newState ? 150 : 0, // 드롭다운 높이에 맞춰 조정
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleVerifyIdentity = () => {
    if (!isPhoneValid()) {
      alert('통신사와 휴대폰 번호를 모두 입력해주세요!');
      return;
    }
    // 본인 인증 로직
    alert('본인 인증을 진행합니다!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.title}>휴대폰 번호를 입력해주세요.</Text>

          {/* 휴대폰 번호 입력칸 */}
          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                opacity: phoneFieldOpacity,
                transform: [{ translateY: phoneFieldTranslateY }],
              },
            ]}
          >
            <Text style={styles.label}>휴대폰 번호</Text>
            <View style={styles.phoneContainer}>
              {/* 통신사 선택 버튼 */}
              <TouchableOpacity
                style={styles.carrierButton}
                onPress={toggleDropdown}
              >
                <Text style={styles.carrierButtonText}>
                  {selectedCarrier || '통신사'}
                </Text>
                <Text style={styles.arrow}>
                  {isDropdownOpen ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {/* 휴대폰 번호 입력 */}
              <TextInput
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="010-1234-5678"
                keyboardType="phone-pad"
                maxLength={13}
                style={styles.phoneInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleVerifyIdentity}
              />
            </View>

            {/* 통신사 드롭다운 */}
            {isDropdownOpen && (
              <View style={styles.dropdown}>
                {carriers.map((carrier) => (
                  <TouchableOpacity
                    key={carrier}
                    style={[
                      styles.dropdownItem,
                      selectedCarrier === carrier && styles.selectedItem
                    ]}
                    onPress={() => handleCarrierSelect(carrier)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedCarrier === carrier && styles.selectedItemText
                    ]}>
                      {carrier}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>

          {/* 주민등록번호 표시 (아래로 슬라이드) */}
          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                transform: [
                  { translateY: residentIdFieldTranslateY },
                  { translateY: dropdownOffset }
                ],
              },
            ]}
          >
            <Text style={styles.label}>주민등록번호</Text>
            <View style={styles.residentIdContainer}>
              <TextInput
                value={residentFront6 || ''}
                editable={false}
                style={[styles.residentIdInput, styles.disabledInput]}
              />
              <Text style={styles.hyphen}>-</Text>
              <TextInput
                value={residentBack1 ? residentBack1 + '●●●●●●●' : ''}
                editable={false}
                style={[styles.residentIdInput, styles.disabledInput]}
              />
            </View>
          </Animated.View>

          {/* 이름 표시 (아래로 슬라이드) */}
          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                transform: [
                  { translateY: nameFieldTranslateY },
                  { translateY: dropdownOffset }
                ],
              },
            ]}
          >
            <Text style={styles.label}>이름</Text>
            <TextInput
              value={name || ''}
              editable={false}
              style={[styles.input, styles.disabledInput]}
            />
          </Animated.View>

          {/* 본인 인증하기 버튼 - 유효한 입력이 있을 때만 표시 */}
          {isPhoneValid() && (
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerifyIdentity}
            >
              <Text style={styles.verifyButtonText}>본인 인증 하기</Text>
            </TouchableOpacity>
          )}
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
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    color: '#111827',
  },
  fieldBlock: {
    marginTop: 16,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  carrierButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 80,
  },
  carrierButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  arrow: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  phoneInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: 80,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 36,
  },
  selectedItem: {
    backgroundColor: '#EBF8FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
  selectedItemText: {
    color: '#3B82F6',
    fontWeight: '600',
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
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
  verifyButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  residentIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentIdInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    textAlign: 'center',
    minWidth: 60,
  },
  hyphen: {
    fontSize: 16,
    marginHorizontal: 8,
    color: '#111827',
  },
});
