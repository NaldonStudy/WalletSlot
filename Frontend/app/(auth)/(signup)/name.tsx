import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSinupStore } from '@/src/store/signupStore';

export default function NameScreen() {
  const [name, setName] = useState('');
  const setNameStore = useSignupStore((s) => s.setName)

  const goNext = () => {
    // TODO: 이름 유효성 검증 필요 시 추가
    router.replace('/(auth)/(signup)/resident-id');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.title}>이름을 입력해주세요.</Text>

          <View style={styles.fieldBlock}>
            <Text style={styles.label}>이름</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="이름"
              returnKeyType="done"
              onSubmitEditing={goNext}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              importantForAutofill="yes"
            />
          </View>
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
});

 