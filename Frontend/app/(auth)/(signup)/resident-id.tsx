import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSignupStore } from '@/src/store/signupStore';

export default function ResidentIdScreen() {
  const [inputfront6, setFront6] = useState('');
  const [inputback1, setBack1] = useState('');
  const { name, setResidentFront6, setResidentBack1, isResidentIdValid, clearName, clearResidentId, clearPhone } = useSignupStore();
  
  // 애니메이션 값들
  const nameFieldTranslateY = useState(new Animated.Value(0))[0];
  const residentIdFieldOpacity = useState(new Animated.Value(0))[0];
  const residentIdFieldTranslateY = useState(new Animated.Value(50))[0];

  // 컴포넌트 마운트 시 애니메이션 실행
  useEffect(() => {
    // 1단계: 이름 입력칸이 아래로 슬라이드 (사라지지 않고 위치만 이동)
    Animated.timing(nameFieldTranslateY, {
      toValue: 50, // 100에서 50으로 줄임
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      // 2단계: 주민등록번호 입력칸이 나타나면서 위로 슬라이드
      Animated.parallel([
        Animated.timing(residentIdFieldOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(residentIdFieldTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handleFront6Change = (text: string) => {
    // 숫자만 입력 허용하고 6자리로 제한
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setFront6(numericText);
    setResidentFront6(numericText);
  };

  const handleBack1Change = (text: string) => {
    // 1,2,3,4만 입력 허용하고 1자리로 제한
    const validText = text.replace(/[^1-4]/g, '').slice(0, 1);
    setBack1(validText);
    setResidentBack1(validText);
  };

  const goNext = () => {
    if (!isResidentIdValid()) {
      alert('주민등록번호를 올바르게 입력해주세요!');
      return;
    }
    router.replace('/(auth)/(signup)/phone');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.title}>주민등록번호를 입력해주세요.</Text>

          {/* 주민등록번호 입력칸 */}
          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                opacity: residentIdFieldOpacity,
                transform: [{ translateY: residentIdFieldTranslateY }],
              },
            ]}
          >
            <Text style={styles.label}>주민등록번호</Text>
            <View style={styles.residentIdContainer}>
              <TextInput
                value={inputfront6}
                onChangeText={handleFront6Change}
                placeholder=""
                keyboardType="numeric"
                maxLength={6}
                style={styles.residentIdInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => {
                  // 6자리 입력되면 뒷자리로 포커스 이동
                  if (inputfront6.length === 6) {
                    // 다음 입력 필드로 포커스 이동 로직
                  }
                }}
              />
              <Text style={styles.hyphen}>-</Text>
              <TextInput
                value={inputback1}
                onChangeText={handleBack1Change}
                placeholder=""
                keyboardType="numeric"
                maxLength={1}
                style={styles.residentIdInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={goNext}
              />
              <Text style={styles.maskedText}>●●●●●●●</Text>
            </View>
          </Animated.View>

          {/* 이름 입력칸 (아래로 슬라이드) */}
          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                transform: [{ translateY: nameFieldTranslateY }],
              },
            ]}
          >
            <Text style={styles.label}>이름</Text>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => {
                // 이름, 주민등록번호, 휴대폰 번호 모두 초기화
                clearName();
                clearResidentId();
                clearPhone();
                // 로컬 상태도 초기화
                setFront6('');
                setBack1('');
                router.push('/(auth)/(signup)/name');
              }}
              activeOpacity={0.7}
            >
              <TextInput
                value={name || ''}
                editable={false}
                style={[styles.input, styles.disabledInput]}
                pointerEvents="none"
              />
            </TouchableOpacity>
          </Animated.View>
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
    marginBottom: 40,
    color: '#111827',
  },
  fieldBlock: {
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  residentIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentIdInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    minWidth: 60,
  },
  hyphen: {
    fontSize: 16,
    marginHorizontal: 8,
    color: '#111827',
  },
  maskedText: {
    fontSize: 16,
    marginLeft: 8,
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
  inputContainer: {
    // TouchableOpacity를 위한 컨테이너
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
  },
});


