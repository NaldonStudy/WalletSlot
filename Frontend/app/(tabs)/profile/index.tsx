import { ThemedView } from '@/components/ThemedView';
import {
  useConfirmEmailVerification,
  useConfirmPhoneVerification,
  useSendEmailVerification,
  useSendPhoneVerification,
  useUpdateAvatar,
  useUpdateEmail,
  useUpdateJob,
  useUpdateMonthlyIncome,
  useUpdateName,
  useUserProfile
} from '@/src/hooks';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

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

const EditModal: React.FC<EditModalProps> = ({
  visible,
  title,
  value,
  onSave,
  onCancel,
  placeholder,
  keyboardType = 'default',
}) => {
  const [inputValue, setInputValue] = useState(value);

  const handleSave = () => {
    onSave(inputValue);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onCancel}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveText}>저장</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.modalInput}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={placeholder}
            keyboardType={keyboardType}
            autoFocus
          />
        </View>
      </View>
    </Modal>
  );
};

const VerificationModal: React.FC<VerificationModalProps> = ({
  visible,
  type,
  value,
  onCancel,
  onSuccess,
}) => {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [inputValue, setInputValue] = useState(value);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');

  const sendPhoneVerification = useSendPhoneVerification();
  const confirmPhoneVerification = useConfirmPhoneVerification();
  const sendEmailVerification = useSendEmailVerification();
  const confirmEmailVerification = useConfirmEmailVerification();

  const handleSendVerification = async () => {
    try {
      if (type === 'phone') {
        const response = await sendPhoneVerification.mutateAsync(inputValue);
        setVerificationId(response.verificationId);
      } else {
        const response = await sendEmailVerification.mutateAsync(inputValue);
        setVerificationId(response.verificationId);
      }
      setStep('verify');
      Alert.alert('인증번호 발송', `${inputValue}로 인증번호를 발송했습니다.`);
    } catch (error) {
      Alert.alert('오류', '인증번호 발송에 실패했습니다.');
    }
  };

  const handleConfirmVerification = async () => {
    try {
      if (type === 'phone') {
        await confirmPhoneVerification.mutateAsync({
          verificationId,
          code: verificationCode,
          phone: inputValue,
        });
      } else {
        await confirmEmailVerification.mutateAsync({
          verificationId,
          code: verificationCode,
          email: inputValue,
        });
      }
      Alert.alert('성공', `${type === 'phone' ? '휴대폰 번호' : '이메일'}가 변경되었습니다.`);
      onSuccess();
      onCancel();
      setStep('input');
      setVerificationCode('');
      setVerificationId('');
    } catch (error) {
      Alert.alert('오류', '인증에 실패했습니다. 인증번호를 확인해주세요.');
    }
  };

  const handleCancel = () => {
    setStep('input');
    setVerificationCode('');
    setVerificationId('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {type === 'phone' ? '휴대폰 번호 변경' : '이메일 변경'}
            </Text>
            <TouchableOpacity 
              onPress={step === 'input' ? handleSendVerification : handleConfirmVerification}
              disabled={step === 'input' ? !inputValue.trim() : !verificationCode.trim()}
            >
              <Text style={[
                styles.saveText, 
                (!inputValue.trim() || (step === 'verify' && !verificationCode.trim())) && { color: '#ccc' }
              ]}>
                {step === 'input' ? '인증번호 발송' : '확인'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {step === 'input' ? (
            <View style={styles.verificationStep}>
              <Text style={styles.verificationLabel}>
                새로운 {type === 'phone' ? '휴대폰 번호' : '이메일 주소'}를 입력하세요
              </Text>
              <TextInput
                style={styles.modalInput}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={type === 'phone' ? '010-1234-5678' : 'example@email.com'}
                keyboardType={type === 'phone' ? 'numeric' : 'email-address'}
                autoFocus
              />
            </View>
          ) : (
            <View style={styles.verificationStep}>
              <Text style={styles.verificationLabel}>
                {inputValue}로 발송된 인증번호를 입력하세요
              </Text>
              <TextInput
                style={styles.modalInput}
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="인증번호 6자리"
                keyboardType="numeric"
                maxLength={6}
                autoFocus
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
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

  const openEditModal = (
    field: string,
    title: string,
    value: string,
    keyboardType?: 'default' | 'numeric' | 'email-address'
  ) => {
    // 휴대폰번호와 이메일은 인증 모달 사용
    if (field === 'phone') {
      setVerificationModal({
        visible: true,
        type: 'phone',
        value: value || '',
      });
      return;
    }
    
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
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Text style={styles.avatarPlaceholder}>
                {profile.name?.charAt(0) || '?'}
              </Text>
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
                        const result = await ImagePicker.launchImageLibraryAsync({
                          mediaTypes: ImagePicker.MediaTypeOptions.Images,
                          allowsEditing: true,
                          quality: 0.7,
                          base64: true,
                        });
                        if (result.cancelled) return;
                        // result.base64가 있으면 data URI로 변환
                        const base64 = result.base64 ? `data:image/jpeg;base64,${result.base64}` : null;
                        if (!base64) {
                          Alert.alert('오류', '이미지 처리에 실패했습니다.');
                          return;
                        }
                        await updateAvatarMutation.mutateAsync(base64);
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
          
          <Text style={styles.headerName}>{profile.name || '이름 없음'}</Text>
          <Text style={styles.headerEmail}>{profile.email || '이메일 없음'}</Text>
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
            onPress={() => openEditModal('phone', '휴대폰 번호 변경', profile.phone || '', 'numeric')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
                <Ionicons name="call" size={20} color="#7b1fa2" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>휴대폰 번호</Text>
                <Text style={styles.menuValue}>{profile.phone || '미입력'}</Text>
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
                <Text style={styles.menuValue}>{profile.dateOfBirth || '미입력'}</Text>
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
                  {profile.gender === 'M' ? '남성' : 
                   profile.gender === 'F' ? '여성' : 
                   profile.gender === 'O' ? '기타' : '미입력'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 직업정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>직업정보</Text>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => openEditModal('job', '직업 수정', profile.job || '')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e1f5fe' }]}>
                <Ionicons name="briefcase" size={20} color="#0277bd" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>직업</Text>
                <Text style={styles.menuValue}>{profile.job || '미입력'}</Text>
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
                <Text style={styles.menuValue}>{formatIncome(profile.monthlyIncome)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설정</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
                <Ionicons name="notifications" size={20} color="#7b1fa2" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>알림 설정</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e8f5e8' }]}>
                <Ionicons name="shield-checkmark" size={20} color="#388e3c" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>개인정보 처리방침</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e1f5fe' }]}>
                <Ionicons name="document-text" size={20} color="#0277bd" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>서비스 이용약관</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>


        </View>

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

      <VerificationModal
        visible={verificationModal.visible}
        type={verificationModal.type}
        value={verificationModal.value}
        onCancel={() => setVerificationModal({ ...verificationModal, visible: false })}
        onSuccess={() => {
          // 성공 시 프로필 다시 로드
          setVerificationModal({ ...verificationModal, visible: false });
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
});