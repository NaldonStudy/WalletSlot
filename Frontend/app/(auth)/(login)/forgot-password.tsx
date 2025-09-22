import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForgotPinScreen() {
  // carrier + phone만 사용하는 간소화된 UI
  const carriers = ['SKT', 'KT', 'LG U+', '알뜰폰'];
  const [selectedCarrier, setSelectedCarrier] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [phone, setPhone] = useState<string>('010-');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 숫자만(하이픈 제거)
  const sanitized = useMemo(() => phone.replace(/\D/g, ''), [phone]);
  // 통신사 선택 + 010으로 시작하는 11자리
  const isValid = useMemo(() => !!selectedCarrier && /^010\d{8}$/.test(sanitized), [selectedCarrier, sanitized]);

  const handleToggleDropdown = () => setIsDropdownOpen(v => !v);
  const handleSelectCarrier = (carrier: string) => {
    setSelectedCarrier(carrier);
    setIsDropdownOpen(false);
  };

  const handlePhoneChange = (text: string) => {
    // 010- 포맷 강제
    if (!text.startsWith('010-')) {
      setPhone('010-');
      return;
    }
    const numbers = text.replace(/[^0-9]/g, '');
    if (!numbers.startsWith('010')) return;
    let formatted = '010-';
    if (numbers.length > 3) formatted += numbers.slice(3, 7);
    if (numbers.length > 7) formatted += '-' + numbers.slice(7, 11);
    setPhone(formatted);
  };

  const handleNext = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // 기기/번호 인증 화면으로 이동 (목적을 FORGOT_PIN으로 전달)
      router.push({
        pathname: '/(auth)/(signup)/phone-verification',
        params: { phoneNumber: sanitized, purpose: 'FORGOT_PIN' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={styles.title}>PIN 재설정</Text>
          <Text style={styles.subtitle}>등록된 휴대폰 번호로 본인 인증을 진행합니다.</Text>

          <Text style={styles.label}>휴대폰 번호</Text>
          <View style={styles.row}>
            {/* 통신사 선택 */}
            <TouchableOpacity style={styles.carrierButton} onPress={handleToggleDropdown} activeOpacity={0.8}>
              <Text style={styles.carrierText}>{selectedCarrier || '통신사'}</Text>
              <Text style={styles.arrow}>{isDropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {/* 번호 입력 */}
            <TextInput
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="number-pad"
              maxLength={13}
              placeholder="010-1234-5678"
              style={styles.phoneInput}
              returnKeyType="done"
            />
          </View>
          {isDropdownOpen && (
            <View style={styles.dropdown}>
              {carriers.map(c => (
                <TouchableOpacity key={c} style={[styles.dropdownItem, selectedCarrier === c && styles.dropdownItemSelected]} onPress={() => handleSelectCarrier(c)}>
                  <Text style={[styles.dropdownItemText, selectedCarrier === c && styles.dropdownItemTextSelected]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            onPress={handleNext}
            disabled={!isValid || isSubmitting}
            style={[styles.nextButton, (!isValid || isSubmitting) && styles.nextButtonDisabled]}
            activeOpacity={0.8}
          >
            <Text style={[styles.nextButtonText, (!isValid || isSubmitting) && styles.nextButtonTextDisabled]}>
              {isSubmitting ? '진행 중...' : '인증 코드 받기'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.helper}>번호가 변경되었나요? 고객센터로 문의해주세요.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 64 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  carrierButton: {
    height: 52,
    minWidth: 90,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carrierText: { fontSize: 16, color: '#111827' },
  arrow: { fontSize: 12, color: '#6B7280', marginLeft: 8 },
  phoneInput: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  dropdown: {
    marginTop: 4,
    width: 90,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: { backgroundColor: '#EBF8FF' },
  dropdownItemText: { textAlign: 'center', fontSize: 14, color: '#111827' },
  dropdownItemTextSelected: { color: '#3B82F6', fontWeight: '600' },
  nextButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: { backgroundColor: '#E5E7EB' },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  nextButtonTextDisabled: { color: '#9CA3AF' },
  helper: { marginTop: 16, fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
});


