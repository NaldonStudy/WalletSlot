import React from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/ThemedView';
import { Avatar } from '@/src/components/common/Avatar';
import { EditableField } from '@/src/components/common/EditableField';
import { useUpdateEmail, useUpdateJob, useUpdateMonthlyIncome, useUpdateName, useUserProfile } from '@/src/hooks/useProfiles';

export default function ProfileScreen() {
  const { data: profile, isLoading, error } = useUserProfile();

  // 각 필드 수정을 위한 뮤테이션 훅
  const updateNameMutation = useUpdateName();
  const updateEmailMutation = useUpdateEmail();
  const updateJobMutation = useUpdateJob();
  const updateIncomeMutation = useUpdateMonthlyIncome();

  const handleSave = async (field: string, value: string) => {
    try {
      switch (field) {
        case 'name':
          await updateNameMutation.mutateAsync(value);
          break;
        case 'email':
          await updateEmailMutation.mutateAsync(value);
          break;
        case 'job':
          await updateJobMutation.mutateAsync(value);
          break;
        case 'monthlyIncome':
          const income = parseInt(value.replace(/[^0-9]/g, ''), 10);
          if (isNaN(income)) throw new Error('숫자만 입력해주세요.');
          await updateIncomeMutation.mutateAsync(income);
          break;
      }
      Alert.alert('성공', '정보가 업데이트되었습니다.');
    } catch (e: any) {
      Alert.alert('오류', e.message || '업데이트 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>프로필 정보를 불러오는 중...</Text>
      </ThemedView>
    );
  }

  if (error || !profile) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Text style={styles.errorText}>프로필 정보를 불러올 수 없습니다.</Text>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar uri={profile.avatar} size={100} editable onPress={() => Alert.alert('알림', '프로필 이미지 변경 기능은 준비 중입니다.')} />
          <Text style={styles.headerName}>{profile.name}</Text>
          <Text style={styles.headerEmail}>{profile.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개인 정보</Text>
          <EditableField
            label="이름"
            value={profile.name}
            onSave={(value) => handleSave('name', value)}
          />
          <EditableField
            label="이메일"
            value={profile.email}
            keyboardType="email-address"
            onSave={(value) => handleSave('email', value)}
          />
          <EditableField label="휴대폰 번호" value={profile.phone} editable={false} />
          <EditableField label="생년월일" value={profile.dateOfBirth} editable={false} />
          <EditableField
            label="성별"
            value={profile.gender === 'M' ? '남성' : '여성'}
            editable={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>직업 정보</Text>
          <EditableField
            label="직업"
            value={profile.job}
            onSave={(value) => handleSave('job', value)}
          />
          <EditableField
            label="월 수입"
            value={profile.monthlyIncome?.toString() ?? null}
            keyboardType="numeric"
            formatter={(value) => `${parseInt(value, 10).toLocaleString()}원`}
            onSave={(value) => handleSave('monthlyIncome', value)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F2F5' },
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoText: { marginTop: 16, fontSize: 16, color: '#666' },
  errorText: { fontSize: 16, color: 'red' },
  header: {
    backgroundColor: 'white',
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerName: { fontSize: 22, fontWeight: 'bold', marginTop: 12 },
  headerEmail: { fontSize: 16, color: 'gray', marginTop: 4 },
  section: { marginTop: 12 },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  profileItem: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileItemLabel: { fontSize: 16 },
  logoutItem: { alignItems: 'center' },
  logoutText: { color: 'red', fontWeight: 'bold' },
});