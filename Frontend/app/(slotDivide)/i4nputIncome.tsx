import { useSlotDivideStore } from '@/src/store/slotDivideStore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function I4nputIncomeScreen() {
  const [inputIncome, setInputIncome] = useState('');
  const { data, setIncome } = useSlotDivideStore();

  // 애니메이션 값들
  const incomeFieldOpacity = useState(new Animated.Value(0))[0];
  const incomeFieldTranslateY = useState(new Animated.Value(50))[0];

  // 컴포넌트 마운트 시 애니메이션 실행
  useEffect(() => {
    Animated.parallel([
      Animated.timing(incomeFieldOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(incomeFieldTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const goNext = () => {
    // 스토어에 저장
    setIncome(inputIncome);

    if (!inputIncome.trim()) {
      alert('월 수입을 입력해주세요!');
      return;
    }

    // 다음 화면으로 이동
    router.push('/(slotDivide)/i5nputPeriod' as any);
  };

  // 숫자 포맷팅 함수 (3만원 형태로 변환)
  const formatIncome = (value: string) => {
    const numValue = parseInt(value.replace(/,/g, ''));
    if (isNaN(numValue)) return '';
    
    if (numValue >= 10000) {
      return `${Math.floor(numValue / 10000)}만원`;
    } else {
      return `${numValue}원`;
    }
  };

  // 숫자에 콤마 추가
  const addCommas = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleGoBack}
            >
              <Text style={styles.backButtonText}>← 뒤로</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>월 수입을 입력해주세요.</Text>

          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                opacity: incomeFieldOpacity,
                transform: [{ translateY: incomeFieldTranslateY }],
              },
            ]}
          >
            <Text style={styles.label}>기준일</Text>
            <View style={styles.referenceDateContainer}>
              <Text style={styles.referenceDateText}>매월</Text>
              <Text style={styles.referenceDateValue}>{data.baseDay}일</Text>
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                opacity: incomeFieldOpacity,
                transform: [{ translateY: incomeFieldTranslateY }],
              },
            ]}
          >
            <Text style={styles.label}>월 수입</Text>
            <TextInput
              value={inputIncome}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, '');
                setInputIncome(addCommas(numericText));
              }}
              placeholder="월 수입을 입력하세요"
              returnKeyType="done"
              onSubmitEditing={goNext}
              style={styles.input}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {inputIncome && (
              <Text style={styles.formattedIncome}>
                {formatIncome(inputIncome)}
              </Text>
            )}
          </Animated.View>

          <TouchableOpacity style={styles.nextButton} onPress={goNext}>
            <Text style={styles.nextButtonText}>다음</Text>
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
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    color: '#111827',
  },
  fieldBlock: {
    marginTop: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  referenceDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
  },
  referenceDateText: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  referenceDateValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
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
  formattedIncome: {
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 6,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 40,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
