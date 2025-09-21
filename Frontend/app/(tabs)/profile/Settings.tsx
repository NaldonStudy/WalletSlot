import BiometricRegister from '@/app/(tabs)/profile/BiometricRegister';
import ConnectedBanks from '@/app/(tabs)/profile/ConnectedBanks';
import PinChangeModal from '@/app/(tabs)/profile/PinChangeModal';
import PrivacyPolicy from '@/app/(tabs)/profile/PrivacyPolicy';
import TermsOfService from '@/app/(tabs)/profile/TermsOfService';
import { SettingCard } from '@/components/SettingCard';
import { SettingRow } from '@/components/SettingRow';
import { ThemedText } from '@/components/ThemedText';
import { Toggle } from '@/components/Toggle';
import { monitoringService } from '@/src/services/monitoringService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
          <SettingCard>
            <SettingRow
              leftIconName="notifications-outline"
              leftIconColor="#1976d2"
              title="푸시알림 설정"
              right={<Toggle value={pushEnabled} onValueChange={async (v) => {
                setPushEnabled(v);
                monitoringService.logUserInteraction('setting_change', { key: 'push', enabled: v });
                await fetch('/api/users/me/settings/notifications/push', { method: 'PATCH', body: JSON.stringify({ enabled: v }) });
              }} />}
            />
            <SettingRow
              leftIconName="megaphone-outline"
              leftIconColor="#9e9e9e"
              title="마케팅 알림 설정"
              right={<Toggle value={marketingEnabled} onValueChange={async (v) => {
                setMarketingEnabled(v);
                monitoringService.logUserInteraction('setting_change', { key: 'marketing', enabled: v });
                await fetch('/api/users/me/settings/notifications/marketing', { method: 'PATCH', body: JSON.stringify({ enabled: v }) });
              }} />}
            />
          </SettingCard>

          {/* 인증/보안 */}
          <ThemedText style={styles.sectionTitle}>{'인증/보안'}</ThemedText>
          <SettingCard>
            <SettingRow leftIconName="lock-closed-outline" leftIconColor="#616161" title="비밀번호 변경" onPress={() => setPinModalVisible(true)} />
            <SettingRow leftIconName="finger-print-outline" leftIconColor="#616161" title="생체 인증" onPress={() => setBiometricModalVisible(true)} />
          </SettingCard>

          {/* 마이데이터 관리 */}
          <ThemedText style={styles.sectionTitle}>{'마이데이터 관리'}</ThemedText>
          <SettingCard>
            <SettingRow leftIconName="wallet-outline" leftIconColor="#388e3c" title="연결 금융사 관리" onPress={() => setConnectedBanksVisible(true)} />
            <SettingRow leftIconName="sync-outline" leftIconColor="#1976d2" title="마이데이터 재연동" onPress={() => {}} />
            <SettingRow leftIconName="ban-outline" leftIconColor="#d32f2f" title="마이데이터 서비스 해지" onPress={() => {}} />
          </SettingCard>

          {/* 기타 설정 */}
          <ThemedText style={styles.sectionTitle}>{'기타 설정'}</ThemedText>
          <SettingCard>
            <SettingRow leftIconName="document-text-outline" leftIconColor="#616161" title="개인정보 처리방침" onPress={() => setPrivacyPolicyVisible(true)} />
            <SettingRow leftIconName="reader-outline" leftIconColor="#616161" title="이용약관" onPress={() => setTermsOfServiceVisible(true)} />
            <SettingRow leftIconName="log-out-outline" leftIconColor="#d32f2f" title="회원 탈퇴" titleColor="#d32f2f" onPress={() => { Alert.alert('경고', '회원 탈퇴 처리'); }} />
          </SettingCard>

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
});