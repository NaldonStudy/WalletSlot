import Settings from '@/app/(tabs)/profile/Settings';
import { ThemedView } from '@/components/ThemedView';
import { queryKeys } from '@/src/api';
import { BottomSheet, CommonModal, PickerModal } from '@/src/components';
import {
  useConfirmEmailVerification,
  useSendEmailVerification,
  useUpdateAvatar,
  useUpdateEmail,
  useUpdateJob,
  useUpdateMonthlyIncome,
  useUpdateName,
  useUserProfile
} from '@/src/hooks';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
interface EditModalProps {
  visible: boolean;
  title: string;
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
}

interface VerificationModalProps {
  visible: boolean;
  type: 'phone' | 'email';
  value: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const JOB_OPTIONS = [
  { label: '회사원', value: 'OFFICE_WORKER' },
  { label: '학생', value: 'STUDENT' },
  { label: '자영업', value: 'SELF_EMPLOYED' },
  { label: '무직', value: 'UNEMPLOYED' },
  { label: '개발자', value: 'DEVELOPER' },
  { label: '디자이너', value: 'DESIGNER' },
  { label: '기획자', value: 'PLANNER' },
  { label: '마케터', value: 'MARKETER' },
  { label: '영업직', value: 'SALES' },
  { label: '교사/강사', value: 'TEACHER' },
  { label: '의사/간호사', value: 'MEDICAL' },
  { label: '공무원', value: 'CIVIL_SERVANT' },
  { label: '연구원', value: 'RESEARCHER' },
  { label: '예술가/작가', value: 'ARTIST' },
  { label: '서비스직', value: 'SERVICE' },
  { label: '생산/제조직', value: 'MANUFACTURING' },
  { label: '금융업', value: 'FINANCE' },
  { label: '언론인', value: 'MEDIA' },
  { label: '법무직', value: 'LEGAL' },
  { label: '프리랜서', value: 'FREELANCER' },
  { label: '기타', value: 'OTHER' },
];

// 직업 코드를 한글 라벨로 변환하는 함수
const getJobLabel = (jobCode: string) => {
  const job = JOB_OPTIONS.find(option => option.value === jobCode);
  return job ? job.label : jobCode;
};

const JobPicker: React.FC<{
  visible: boolean;
  value: string;
  onCancel: () => void;
  onSelect: (job: string) => void;
}> = ({ visible, value, onCancel, onSelect }) => {
  return (
    <PickerModal
      visible={visible}
      title="직업 선택"
      options={JOB_OPTIONS}
      selectedValue={value}
      onClose={onCancel}
      onCancel={onCancel}
      onSelect={(selectedValue) => {
        onSelect(selectedValue);
        onCancel();
      }}
      singleSelect={true}
    />
  );
};

const formatNumberWithCommas = (numStr: string) => {
  const digits = numStr.replace(/[^0-9]/g, '');
  if (digits === '') return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const EditModal: React.FC<EditModalProps> = ({ visible, title, value, onSave, onCancel, placeholder, keyboardType = 'default' }) => {
  const [inputValue, setInputValue] = useState(value);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => setInputValue(value), [value]);

  useEffect(() => {
    if (keyboardType === 'numeric') {
      const numeric = inputValue.replace(/,/g, '').trim();
      if (numeric === '') setErrorMessage('값을 입력해주세요.');
      else if (!/^[0-9]+$/.test(numeric)) setErrorMessage('숫자만 입력해주세요.');
      else setErrorMessage(null);
    } else {
      if (inputValue.trim() === '') setErrorMessage('값을 입력해주세요.');
      else setErrorMessage(null);
    }
  }, [inputValue, keyboardType]);

  const hasChanged = inputValue !== value;

  const handleSave = () => {
    if (errorMessage) return;
    onSave(inputValue);
    onCancel();
  };

  return (
    <BottomSheet
      visible={visible}
      title={title}
      onClose={onCancel}
      height="auto"
    >
      <View style={{ padding: 16 }}>
        <TextInput
          style={styles.modalInput}
          value={inputValue}
          onChangeText={(text) => {
            if (keyboardType === 'numeric') setInputValue(formatNumberWithCommas(text));
            else setInputValue(text);
          }}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoFocus
        />
        {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}
        
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: '#f5f5f5', flex: 1, justifyContent: 'center' }]} 
            onPress={onCancel}
          >
            <Text style={[styles.menuLabel, { color: '#666', textAlign: 'center' }]}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.menuItem, 
              { 
                backgroundColor: (!!errorMessage || !hasChanged) ? '#ccc' : '#667eea', 
                flex: 1,
                justifyContent: 'center'
              }
            ]} 
            onPress={handleSave} 
            disabled={!!errorMessage || !hasChanged}
          >
            <Text style={[styles.menuLabel, { color: '#fff', textAlign: 'center' }]}>저장</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const VerificationModal: React.FC<VerificationModalProps> = ({ visible, type, value, onCancel, onSuccess }) => {
  // 이메일 인증만 모달로 처리, 휴대폰은 기존 인증 페이지 사용
  const [inputValue, setInputValue] = useState(value);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sendEmailVerification = useSendEmailVerification();
  const confirmEmailVerification = useConfirmEmailVerification();
  const queryClient = useQueryClient();

  useEffect(() => {
    setInputValue(value);
    setStep('input');
    setVerificationCode('');
    setVerificationId('');
    setErrorMessage(null);
  }, [visible, value]);

  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendVerification = async () => {
    try {
      if (!isValidEmail(inputValue.trim())) {
        setErrorMessage('유효한 이메일 주소를 입력하세요.');
        return;
      }

      const response: any = await sendEmailVerification.mutateAsync(inputValue);
      setVerificationId(response?.verificationId || '');
      setStep('verify');
      setErrorMessage(null);
      Alert.alert('인증번호 발송', `${inputValue}로 인증번호를 발송했습니다.`);
    } catch (err) {
      Alert.alert('오류', '인증번호 발송에 실패했습니다.');
    }
  };

  const handleConfirmVerification = async () => {
    try {
      await confirmEmailVerification.mutateAsync({ verificationId, code: verificationCode, email: inputValue });
      Alert.alert('성공', '이메일이 변경되었습니다.');
      onSuccess();
      onCancel();
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    } catch (err) {
      Alert.alert('오류', '인증에 실패했습니다. 인증번호를 확인해주세요.');
    }
  };

  const handleCancel = () => {
    setStep('input');
    setVerificationCode('');
    setVerificationId('');
    onCancel();
  };

  // 휴대폰 인증은 렌더링하지 않음 (기존 인증 페이지 사용)
  if (type === 'phone') {
    return null;
  }

  return (
    <CommonModal 
      visible={visible} 
      animationType="slide" 
      position="fullscreen" 
      onClose={handleCancel}
      closeOnOverlayPress={false}
    >
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleCancel}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>이메일 변경</Text>
          <TouchableOpacity onPress={step === 'input' ? handleSendVerification : handleConfirmVerification} 
            disabled={step === 'input' ? (!!errorMessage || !inputValue.trim()) : !verificationCode.trim()}>
            <Text style={[styles.saveText, 
              (step === 'input' ? (!!errorMessage || !inputValue.trim()) : !verificationCode.trim()) && { color: '#ccc' }]}>
              {step === 'input' ? '인증번호 발송' : '확인'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.verificationStep}>
          {step === 'input' ? (
            <View>
              <Text style={styles.verificationLabel}>새로운 이메일 주소를 입력하세요</Text>
              <TextInput
                style={styles.modalInput}
                value={inputValue}
                onChangeText={(text) => {
                  setInputValue(text);
                  const email = text.trim();
                  if (email === '') setErrorMessage('값을 입력해주세요.');
                  else {
                    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!re.test(email)) setErrorMessage('유효한 이메일 주소를 입력하세요.');
                    else setErrorMessage(null);
                  }
                }}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoFocus
              />
              
              {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}
            </View>
          ) : (
            <View>
              <Text style={styles.verificationLabel}>{inputValue}로 발송된 인증번호를 입력하세요</Text>
              <TextInput style={styles.modalInput} value={verificationCode} onChangeText={setVerificationCode} placeholder="인증번호 6자리" keyboardType="numeric" maxLength={6} autoFocus />
            </View>
          )}
        </View>
      </View>
    </CommonModal>
  );
};

export default function ProfileScreen() {
  const { data: profile, isLoading, error } = useUserProfile();
  const updateNameMutation = useUpdateName();
  const updateEmailMutation = useUpdateEmail();
  const updateJobMutation = useUpdateJob();
  const updateIncomeMutation = useUpdateMonthlyIncome();
  const updateAvatarMutation = useUpdateAvatar();

  const [editModal, setEditModal] = useState<{
    visible: boolean;
    field: string;
    title: string;
    value: string;
    keyboardType?: 'default' | 'numeric' | 'email-address';
  }>({
    visible: false,
    field: '',
    title: '',
    value: '',
  });

  const [verificationModal, setVerificationModal] = useState<{
    visible: boolean;
    type: 'phone' | 'email';
    value: string;
  }>({
    visible: false,
    type: 'phone',
    value: '',
  });
  const [jobPicker, setJobPicker] = useState<{ visible: boolean; value: string }>({ visible: false, value: '' });
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settingsState, setSettingsState] = useState<{ push?: boolean; marketing?: boolean } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('settings');
        if (raw) setSettingsState(JSON.parse(raw));
        else setSettingsState({ push: true, marketing: false });
      } catch (e) {
        console.error('Load settings failed', e);
      }
    })();
  }, []);

  const openEditModal = (
    field: string,
    title: string,
    value: string,
    keyboardType?: 'default' | 'numeric' | 'email-address'
  ) => {
    // 휴대폰번호는 기존 인증 페이지로 라우팅
    if (field === 'phone') {
      // 기존 회원가입용 휴대폰 인증 페이지 재활용
      router.push({
        pathname: '/(auth)/(signup)/phone' as any,
        params: {
          mode: 'profile_update', // 프로필 수정 모드 표시
          currentPhone: value || '',
          // 기존 프로필 정보 전달 (인증용)
          currentName: profile?.name || '',
          currentBirthDate: profile?.birthDate || '',
          currentGender: profile?.gender || ''
        }
      });
      return;
    }
    
    // 이메일은 인증 모달 사용
    if (field === 'email') {
      setVerificationModal({
        visible: true,
        type: 'email',
        value: value || '',
      });
      return;
    }

    setEditModal({
      visible: true,
      field,
      title,
      value: value || '',
      keyboardType,
    });
  };

  const closeEditModal = () => {
    setEditModal({
      visible: false,
      field: '',
      title: '',
      value: '',
    });
  };

  const handleSave = async (value: string) => {
    try {
      switch (editModal.field) {
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
          const income = parseInt(value.replace(/,/g, ''), 10);
          if (isNaN(income)) {
            Alert.alert('오류', '올바른 숫자를 입력해주세요.');
            return;
          }
          await updateIncomeMutation.mutateAsync(income);
          break;
      }
      Alert.alert('성공', '정보가 수정되었습니다.');
    } catch (error) {
      Alert.alert('오류', '수정 중 오류가 발생했습니다.');
      console.error('Update error:', error);
    }
  };

  const formatIncome = (income: number | null) => {
    if (!income) return '미입력';
    return `${income.toLocaleString()}원`;
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>프로필 정보를 불러오는 중...</Text>
        </View>
      </ThemedView>
    );
  }

  if (error || !profile) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>프로필 정보를 불러올 수 없습니다.</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 프로필 헤더 */}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {/* 새로운 API 스펙에는 avatar가 없으므로 항상 플레이스홀더 표시 */}
              <Text style={styles.avatarPlaceholder}>{profile.name?.charAt(0) || '?'}</Text>
            </View>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() =>
                Alert.alert('프로필 사진', '프로필 사진 변경 기능', [
                  { text: '취소', style: 'cancel' },
                  { text: '카메라', onPress: () => console.log('카메라 선택') },
                  {
                    text: '갤러리',
                    onPress: async () => {
                      try {
                        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (!permission.granted) {
                          Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
                          return;
                        }
                        const result: any = await ImagePicker.launchImageLibraryAsync({
                          mediaTypes: ImagePicker.MediaTypeOptions.Images,
                          allowsEditing: true,
                          quality: 0.7,
                          base64: false,
                        });

                        if ((result.cancelled && result.cancelled === true) || (result.canceled && result.canceled === true)) return;

                        let base64: string | null = null;
                        let fileUri: string | null = null;

                        if (result.base64) {
                          base64 = `data:image/jpeg;base64,${result.base64}`;
                        } else if (Array.isArray(result.assets) && result.assets[0]) {
                          const asset = result.assets[0];
                          fileUri = asset.uri || null;
                          if (asset.base64) {
                            const mime = asset.type || 'image/jpeg';
                            base64 = `data:${mime};base64,${asset.base64}`;
                          }
                        }

                        if (fileUri) {
                          // 로컬 URI가 있으면 업로드 함수에서 FormData 경로를 시도합니다.
                          await updateAvatarMutation.mutateAsync(fileUri);
                        } else if (base64) {
                          await updateAvatarMutation.mutateAsync(base64);
                        } else {
                          Alert.alert('오류', '선택한 이미지에서 데이터를 얻을 수 없습니다.');
                          return;
                        }
                        Alert.alert('성공', '프로필 사진이 업데이트되었습니다.');
                      } catch (e) {
                        console.error('Avatar upload failed', e);
                        Alert.alert('오류', '프로필 사진 업로드에 실패했습니다.');
                      }
                    },
                  },
                ])
              }
            >
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerMeta}>
            <View>
              <Text style={styles.headerName}>{profile.name || '이름 없음'}</Text>
              <Text style={styles.headerEmail}>{profile.email || '이메일 없음'}</Text>
            </View>
            <TouchableOpacity style={styles.settingsButton} onPress={() => setSettingsModalVisible(true)}>
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 개인정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>개인정보</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openEditModal('name', '이름 수정', profile.name || '')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="person" size={20} color="#1976d2" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>이름</Text>
                <Text style={styles.menuValue}>{profile.name || '미입력'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openEditModal('phone', '휴대폰 번호 변경', profile.phoneNumber || '', 'numeric')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
                <Ionicons name="call" size={20} color="#7b1fa2" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>휴대폰 번호</Text>
                <Text style={styles.menuValue}>{profile.phoneNumber || '미입력'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openEditModal('email', '이메일 변경', profile.email || '', 'email-address')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
                <Ionicons name="mail" size={20} color="#f57f17" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>이메일</Text>
                <Text style={styles.menuValue}>{profile.email || '미입력'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e8f5e8' }]}>
                <Ionicons name="calendar" size={20} color="#388e3c" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>생년월일</Text>
                <Text style={styles.menuValue}>{profile.birthDate || '미입력'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#fce4ec' }]}>
                <Ionicons name="male-female" size={20} color="#c2185b" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>성별</Text>
                <Text style={styles.menuValue}>
                  {profile.gender === 'MAN' ? '남성' : 
                   profile.gender === 'WOMAN' ? '여성' : 
                   profile.gender === 'OTHER' ? '기타' : '미입력'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 직업정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>직업정보</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => setJobPicker({ visible: true, value: profile.job || '' })}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e1f5fe' }]}>
                <Ionicons name="briefcase" size={20} color="#0277bd" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>직업</Text>
                <Text style={styles.menuValue}>{profile.job ? getJobLabel(profile.job) : '미입력'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openEditModal('monthlyIncome', '월 수입 수정', profile.monthlyIncome?.toString() || '', 'numeric')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#fff8e1' }]}>
                <Ionicons name="card" size={20} color="#f9a825" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>월 수입</Text>
                <Text style={styles.menuValue}>{formatIncome(profile.monthlyIncome || null)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* '설정' 섹션 제거 — 설정 진입은 우측 상단 톱니버튼으로 이동 */}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <EditModal
        visible={editModal.visible}
        title={editModal.title}
        value={editModal.value}
        onSave={handleSave}
        onCancel={closeEditModal}
        keyboardType={editModal.keyboardType}
        placeholder={`${editModal.title.replace(' 수정', '')}을(를) 입력하세요`}
      />

      <JobPicker
        visible={jobPicker.visible}
        value={jobPicker.value}
        onCancel={() => setJobPicker({ ...jobPicker, visible: false })}
        onSelect={async (job) => {
          try {
            await updateJobMutation.mutateAsync(job);
            Alert.alert('성공', '직업이 변경되었습니다.');
          } catch (e) {
            Alert.alert('오류', '직업 변경에 실패했습니다.');
          }
        }}
      />

  <Settings visible={settingsModalVisible} onClose={() => setSettingsModalVisible(false)} />
      

      <VerificationModal
        key={`${verificationModal.type}-${verificationModal.visible}-${verificationModal.value}`}
        visible={verificationModal.visible}
        type={verificationModal.type}
        value={verificationModal.value}
        onCancel={() => setVerificationModal({ ...verificationModal, visible: false })}
        onSuccess={() => {
          // 성공 시 프로필 다시 로드
          setVerificationModal({ ...verificationModal, visible: false });
          queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  scrollView: { 
    flex: 1 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    fontSize: 16, 
    color: '#666', 
    marginTop: 16 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorText: { 
    fontSize: 16, 
    color: '#ff6b6b', 
    marginTop: 16,
    textAlign: 'center' 
  },
  
  // 헤더 스타일
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  avatarPlaceholder: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  headerMeta: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  
  // 섹션 스타일
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  
  // 메뉴 아이템 스타일
  menuItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  menuValue: {
    fontSize: 14,
    color: '#666',
  },

  
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  modalInput: {
    margin: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inlineError: {
    marginHorizontal: 20,
    color: '#d32f2f',
    fontSize: 13,
    marginTop: 6,
  },
  
  // 바텀 스페이싱
  bottomSpacing: {
    height: 100,
  },
  
  // 인증 모달 스타일
  verificationStep: {
    padding: 20,
  },
  verificationLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingsSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  divider: {
    height: 8,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  dangerText: {
    color: '#d32f2f',
    fontWeight: '600',
  },
});