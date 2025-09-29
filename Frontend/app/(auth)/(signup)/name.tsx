import { appService } from '@/src/services/appService';
import { useSignupStore } from '@/src/store/signupStore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NameScreen() {
  const [inputName, setLocalName] = useState('');
  const { setName, isNameValid } = useSignupStore();
  

  // 애니메이션 값들
  const nameFieldOpacity = useState(new Animated.Value(0))[0];
  const nameFieldTranslateY = useState(new Animated.Value(50))[0];

  /** 기존 회원 로그인으로 이동 */
  const handleGoLogin = async () => {
    await appService.setOnboardingCompleted(true);
    router.replace('/(auth)/(login)/login' as any);
  };

  // 컴포넌트 마운트 시 애니메이션 실행
  useEffect(() => {
    Animated.parallel([
      Animated.timing(nameFieldOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(nameFieldTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const goNext = () => {
    // 스토어에 저장
    setName(inputName);

    if (!isNameValid()) {
        alert('이름을 입력해주세요!');
        return;
    }

    router.replace('/(auth)/(signup)/resident-id');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.title}>이름을 입력해주세요.</Text>

          <Animated.View 
            style={[
              styles.fieldBlock,
              {
                opacity: nameFieldOpacity,
                transform: [{ translateY: nameFieldTranslateY }],
              },
            ]}
          >
            <Text style={styles.label}>이름</Text>
            <TextInput
              value={inputName}
              onChangeText={setLocalName}
              placeholder="이름"
              returnKeyType="done"
              onSubmitEditing={goNext}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              importantForAutofill="yes"
            />
          </Animated.View>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleGoLogin}>
            <Text style={styles.secondaryButtonText}>기존 회원 로그인 하러가기</Text>
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
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 8,
  },
});

 