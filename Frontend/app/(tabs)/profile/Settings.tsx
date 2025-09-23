import BiometricRegister from '@/app/(tabs)/profile/BiometricRegister';
import ConnectedBanks from '@/app/(tabs)/profile/ConnectedBanks';
import PinChangeModal from '@/app/(tabs)/profile/PinChangeModal';
import PrivacyPolicy from '@/app/(tabs)/profile/PrivacyPolicy';
import TermsOfService from '@/app/(tabs)/profile/TermsOfService';
import { ThemedText } from '@/components/ThemedText';
import { Toggle } from '@/components/Toggle';
import { CommonCard } from '@/src/components';
import { monitoringService } from '@/src/services/monitoringService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = { visible: boolean; onClose: () => void };

export default function Settings({ visible, onClose }: Props) {
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [biometricModalVisible, setBiometricModalVisible] = useState(false);
  const [connectedBanksVisible, setConnectedBanksVisible] = useState(false);
  const [privacyPolicyVisible, setPrivacyPolicyVisible] = useState(false);
  const [termsOfServiceVisible, setTermsOfServiceVisible] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [devPin, setDevPin] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const res = await fetch('/api/users/me/settings');
        if (!res.ok) return;
        const data = await res.json();
        setPushEnabled(Boolean(data.notifications?.push));
        setMarketingEnabled(Boolean(data.notifications?.marketing));
        setBiometricEnabled(Boolean(data.biometric));
      } catch (e) {
        // ignore
      }
    })();
  }, [visible]);

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>{'환경설정'}</ThemedText>
          <Pressable onPress={onClose} style={styles.headerButtonLeft} accessibilityLabel="뒤로">
            <Ionicons name="chevron-back" size={24} color="#333" />
          </Pressable>
          <Pressable onPress={onClose} style={styles.headerButtonRight} accessibilityLabel="닫기">
            <Ionicons name="close" size={22} color="#666" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* 알림 설정 */}
          <ThemedText style={styles.sectionTitle}>{'알림 설정'}</ThemedText>
          <CommonCard variant="outlined" padding="none">
            <View style={styles.settingRow}>
              <View style={[styles.iconWrap, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="notifications-outline" size={18} color="#1976d2" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.settingTitle}>푸시알림 설정</ThemedText>
              </View>
              <Toggle value={pushEnabled} onValueChange={async (v) => {
                setPushEnabled(v);
                monitoringService.logUserInteraction('setting_change', { key: 'push', enabled: v });
                await fetch('/api/users/me/settings/notifications/push', { method: 'PATCH', body: JSON.stringify({ enabled: v }) });
              }} />
            </View>
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={[styles.iconWrap, { backgroundColor: '#f5f5f5' }]}>
                <Ionicons name="megaphone-outline" size={18} color="#9e9e9e" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.settingTitle}>마케팅 알림 설정</ThemedText>
              </View>
              <Toggle value={marketingEnabled} onValueChange={async (v) => {
                setMarketingEnabled(v);
                monitoringService.logUserInteraction('setting_change', { key: 'marketing', enabled: v });
                await fetch('/api/users/me/settings/notifications/marketing', { method: 'PATCH', body: JSON.stringify({ enabled: v }) });
              }} />
            </View>
          </CommonCard>

          {/* 인증/보안 */}
          <ThemedText style={styles.sectionTitle}>{'인증/보안'}</ThemedText>
          <CommonCard variant="outlined" padding="none">
            <TouchableOpacity style={styles.settingRow} onPress={() => setPinModalVisible(true)}>
              <View style={[styles.iconWrap, { backgroundColor: '#f5f5f5' }]}>
                <Ionicons name="lock-closed-outline" size={18} color="#616161" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.settingTitle}>비밀번호 변경</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder]} onPress={() => setBiometricModalVisible(true)}>
              <View style={[styles.iconWrap, { backgroundColor: '#f5f5f5' }]}>
                <Ionicons name="finger-print-outline" size={18} color="#616161" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.settingTitle}>생체 인증</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
          </CommonCard>

          {/* 마이데이터 관리 */}
          <ThemedText style={styles.sectionTitle}>{'마이데이터 관리'}</ThemedText>
          <CommonCard variant="outlined" padding="none">
            <TouchableOpacity style={styles.settingRow} onPress={() => setConnectedBanksVisible(true)}>
              <View style={[styles.iconWrap, { backgroundColor: '#e8f5e8' }]}>
                <Ionicons name="wallet-outline" size={18} color="#388e3c" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.settingTitle}>연결 금융사 관리</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder]} onPress={() => {}}>
              <View style={[styles.iconWrap, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="sync-outline" size={18} color="#1976d2" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.settingTitle}>마이데이터 재연동</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder]} onPress={() => {}}>
              <View style={[styles.iconWrap, { backgroundColor: '#ffebee' }]}>
                <Ionicons name="ban-outline" size={18} color="#d32f2f" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.settingTitle}>마이데이터 서비스 해지</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
          </CommonCard>

          {/* 기타 설정 */}
          <ThemedText style={styles.sectionTitle}>{'기타 설정'}</ThemedText>
          <CommonCard variant="outlined" padding="none">
            <TouchableOpacity style={styles.settingRow} onPress={() => setPrivacyPolicyVisible(true)}>
              <View style={[styles.iconWrap, { backgroundColor: '#f5f5f5' }]}>
                <Ionicons name="document-text-outline" size={18} color="#616161" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.settingTitle}>개인정보 처리방침</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder]} onPress={() => setTermsOfServiceVisible(true)}>
              <View style={[styles.iconWrap, { backgroundColor: '#f5f5f5' }]}>
                <Ionicons name="reader-outline" size={18} color="#616161" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.settingTitle}>이용약관</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, styles.settingRowBorder]} onPress={() => { Alert.alert('경고', '회원 탈퇴 처리'); }}>
              <View style={[styles.iconWrap, { backgroundColor: '#ffebee' }]}>
                <Ionicons name="log-out-outline" size={18} color="#d32f2f" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.settingTitle, { color: '#d32f2f' }]}>회원 탈퇴</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
          </CommonCard>

          {/* 개발용 PIN 조회 */}
          {__DEV__ && (
            <View style={{ marginTop: 24 }}>
              <Pressable
                onPress={async () => {
                  try {
                    const res = await fetch('/__dev/pin');
                    if (!res.ok) { setDevPin('조회 실패'); return; }
                    const json = await res.json();
                    setDevPin(String(json.currentPin));
                  } catch (e) {
                    setDevPin('오류');
                  }
                }}
                style={styles.devButton}
              >
                <ThemedText>{'개발: 현재 PIN 보기'}</ThemedText>
              </Pressable>
              {devPin !== null && <ThemedText style={{ marginTop: 8 }}>{`현재 PIN: ${devPin}`}</ThemedText>}
            </View>
          )}
        </ScrollView>

        <PinChangeModal visible={pinModalVisible} onClose={() => setPinModalVisible(false)} onSuccess={() => {
          Alert.alert('완료', 'PIN이 성공적으로 변경되었습니다.');
        }} />

        <BiometricRegister visible={biometricModalVisible} initialEnabled={biometricEnabled} onClose={() => setBiometricModalVisible(false)} onRegistered={() => {
          setBiometricEnabled(true);
        }} />

        <ConnectedBanks visible={connectedBanksVisible} onClose={() => setConnectedBanksVisible(false)} />

        <PrivacyPolicy visible={privacyPolicyVisible} onClose={() => setPrivacyPolicyVisible(false)} />

        <TermsOfService visible={termsOfServiceVisible} onClose={() => setTermsOfServiceVisible(false)} />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 18,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerButtonLeft: {
    position: 'absolute',
    left: 18,
  },
  headerButtonRight: {
    position: 'absolute',
    right: 18,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  devButton: {
    padding: 10,
    backgroundColor: '#f0f0f5',
    borderRadius: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#222',
  },
});