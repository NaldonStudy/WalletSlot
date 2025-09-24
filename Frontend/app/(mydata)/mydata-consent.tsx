import { ThemedText } from '@/components/ThemedText';
import { mydataApi } from '@/src/api/mydata';
import { useBankSelectionStore } from '@/src/store/bankSelectionStore';
import { useLocalUserStore } from '@/src/store/localUserStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function MyDataConsentScreen() {
  const router = useRouter();
  const { user } = useLocalUserStore();
  const displayName = user?.userName || '사용자';
  const selectedBankCodes = useBankSelectionStore(s => s.selectedBankCodes);

  const [showDoc1, setShowDoc1] = useState(false); // 전송요구서
  const [showDoc2, setShowDoc2] = useState(false); // 수집/이용 동의
  const [showDoc3, setShowDoc3] = useState(false); // 제공 동의

  const [agree1, setAgree1] = useState(false); // 수집/이용 (필수)
  const [agree2, setAgree2] = useState(false); // 제공 (필수)
  const [agreeTransfer, setAgreeTransfer] = useState(false); // 전송요구서 동의 (필수)

  const canProceed = agreeTransfer && agree1 && agree2;

  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [creatingConsent, setCreatingConsent] = useState(false);
  const [hasActiveConsent, setHasActiveConsent] = useState<boolean | null>(null);

  React.useEffect(() => {
    let mounted = true;
    mydataApi
      .listConsents('ACTIVE')
      .then(list => {
        if (!mounted) return;
        setHasActiveConsent(list && list.length > 0);
      })
      .catch(() => setHasActiveConsent(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleProceed = async () => {
    if (!canProceed || creatingConsent) return;
    try {
      setCreatingConsent(true);
      if (!hasActiveConsent) {
        await mydataApi.createConsent({ consentFormUuid: 'mydata-v1' });
      }
      setShowCertModal(true);
    } catch (e) {
      console.warn('[MYDATA] 동의 생성 실패', e);
      setShowCertModal(true);
    } finally {
      setCreatingConsent(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ThemedText style={styles.backIcon}>{'<'}</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>약관 동의</ThemedText>
        </View>
        <ThemedText style={styles.subtitle}>{displayName}님의 계좌를 불러오기 위해 필요해요</ThemedText>

        {/* 전송요구서 요약 */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>전송요구서 (가입상품 목록, 상세정보)</ThemedText>
          <View style={styles.paperPreview}>
            <Image
              source={require('@/src/assets/images/mydataconsent/transmissionshort.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity onPress={() => setShowDoc1(true)}>
            <ThemedText style={styles.link}>자세히 보기</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkRow} onPress={() => setAgreeTransfer(!agreeTransfer)}>
            <View style={[styles.checkbox, agreeTransfer && styles.checkboxOn]}>
              {agreeTransfer && (<ThemedText style={styles.checkmark}>✓</ThemedText>)}
            </View>
            <ThemedText style={styles.checkText}>상기 내용을 확인하였으며 &lsquo;가입상품 목록&rsquo; 및 &lsquo;상세정보&rsquo; 전송을 요구합니다.</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 수집/이용 동의서 (필수) */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>개인(신용)정보 수집·이용 동의서 (필수)</ThemedText>
          <View style={styles.paperPreview}>
            <Image
              source={require('@/src/assets/images/mydataconsent/useConsentShort.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity onPress={() => setShowDoc2(true)}>
            <ThemedText style={styles.link}>자세히 보기</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkRow} onPress={() => setAgree1(!agree1)}>
            <View style={[styles.checkbox, agree1 && styles.checkboxOn]}>
              {agree1 && (<ThemedText style={styles.checkmark}>✓</ThemedText>)}
            </View>
            <ThemedText style={styles.checkText}>상기 내용을 확인하였으며 개인(신용)정보 수집·이용에 동의합니다.</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 제공 동의서 (필수) */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>개인(신용)정보 제공 동의서 (필수)</ThemedText>
          <View style={styles.paperPreview}>
            <Image
              source={require('@/src/assets/images/mydataconsent/provideConsentShort.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity onPress={() => setShowDoc3(true)}>
            <ThemedText style={styles.link}>자세히 보기</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkRow} onPress={() => setAgree2(!agree2)}>
            <View style={[styles.checkbox, agree2 && styles.checkboxOn]}>
              {agree2 && (<ThemedText style={styles.checkmark}>✓</ThemedText>)}
            </View>
            <ThemedText style={styles.checkText}>상기 내용을 확인하였으며 개인(신용)정보 제3자 제공에 동의합니다.</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.bottom}>
        <TouchableOpacity
          disabled={!canProceed}
          style={[styles.primaryBtn, canProceed ? styles.primaryOn : styles.primaryOff]}
          onPress={handleProceed}
        >
          <ThemedText style={[styles.primaryText, !canProceed && styles.primaryTextOff]}>동의하고 불러오기</ThemedText>
        </TouchableOpacity>
      </View>

      {/* 모달들 */}
      <DocModal
        visible={showDoc1}
        title="전송요구서(가입상품 목록, 상세정보)"
        onClose={() => setShowDoc1(false)}
        imageSource={require('@/src/assets/images/mydataconsent/transmissionRequest.png')}
      />
      <DocModal
        visible={showDoc2}
        title="개인(신용)정보 수집·이용 동의서"
        onClose={() => setShowDoc2(false)}
        imageSource={require('@/src/assets/images/mydataconsent/useConsent.png')}
      />
      <DocModal
        visible={showDoc3}
        title="개인(신용)정보 제공 동의서"
        onClose={() => setShowDoc3(false)}
        imageSource={require('@/src/assets/images/mydataconsent/provideConsent.png')}
      />

      {/* 인증서 선택 모달 */}
      <Modal
        visible={showCertModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCertModal(false)}
      >
        <View style={styles.certOverlay}>
          <View style={styles.certSheet}>
            <View style={styles.certHeader}>
              <ThemedText style={styles.certTitle}>인증서 선택</ThemedText>
              <TouchableOpacity onPress={() => setShowCertModal(false)}>
                <ThemedText style={styles.certClose}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.certGrid}>
              {[
                { key: 'naver', label: '네이버 인증서', icon: require('@/src/assets/images/mydataconsent/naver.png') },
                { key: 'kakao', label: '카카오톡 인증서', icon: require('@/src/assets/images/mydataconsent/kakao.png') },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.certItem,
                    selectedCert === item.key && styles.certItemSelected,
                  ]}
                  onPress={() => setSelectedCert(item.key)}
                >
                  <Image source={item.icon} style={styles.certIcon} resizeMode="contain" />
                  <ThemedText style={styles.certLabel}>{item.label}</ThemedText>
                  {selectedCert === item.key && (
                    <View style={styles.certCheck}><ThemedText style={styles.certCheckText}>✓</ThemedText></View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, selectedCert ? styles.primaryOn : styles.primaryOff]}
              disabled={!selectedCert}
              onPress={() => {
                if (!selectedCert) return;
                setShowCertModal(false);
                router.push({ pathname: '/(mydata)/authenticationPin', params: { banks: selectedBankCodes?.join(',') || '' } } as any);
              }}
            >
              <ThemedText style={[styles.primaryText, !selectedCert && styles.primaryTextOff]}>확인</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DocModal({ visible, title, onClose, imageSource }: { visible: boolean; title: string; onClose: () => void; imageSource?: any }) {
  // 이미지 비율 동적 계산
  const getImageStyle = () => {
    if (!imageSource) return styles.modalImage;
    
    try {
      const resolvedSource = Image.resolveAssetSource(imageSource);
      const aspectRatio = resolvedSource ? resolvedSource.width / resolvedSource.height : 0.72;
      
      return {
        ...styles.modalImage,
        aspectRatio: aspectRatio,
      };
    } catch (error) {
      return styles.modalImage;
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <ThemedText style={styles.modalTitle}>{title}</ThemedText>
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator
          >
            {imageSource ? (
              <Image 
                source={imageSource} 
                style={getImageStyle()}
                resizeMode="contain"
              />
            ) : (
              <>
                {/* 실제 문서 영역(샘플 박스들로 구성) */}
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>수집·이용 목적</ThemedText>
                  <View style={styles.tableBox} />
                </View>
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>보유 및 이용기간</ThemedText>
                  <View style={styles.tableBox} />
                </View>
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>제공받는 자/제공항목 등</ThemedText>
                  <View style={[styles.tableBox, { height: 260 }]} />
                </View>
              </>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.modalConfirm} onPress={onClose}>
            <ThemedText style={styles.modalConfirmText}>확인</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  body: { padding: 20, paddingBottom: 120 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  backIcon: { fontSize: 20, color: '#111' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  subtitle: { fontSize: 16, color: '#111', marginBottom: 12 },
  card: {
    borderWidth: 1, borderColor: '#E6EAF0', borderRadius: 12, padding: 16, backgroundColor: '#fff', marginBottom: 16,
  },
  cardTitle: { fontWeight: '700', color: '#333', marginBottom: 12 },
  paperPreview: { height: 160, borderRadius: 8, backgroundColor: '#F3F6FA', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10, padding: 12, justifyContent: 'center' },
  previewText: { fontSize: 14, lineHeight: 20, color: '#4B5563' },
  link: { color: '#2383BD', fontWeight: '600' },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C9D1D9' },
  checkboxOn: { backgroundColor: '#2383BD', borderColor: '#2383BD' },
  checkText: { marginLeft: 10, color: '#4B5563' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center', lineHeight: 14 },

  bottom: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  primaryBtn: { borderRadius: 10, alignItems: 'center', paddingVertical: 16 },
  primaryOn: { backgroundColor: '#2383BD' },
  primaryOff: { backgroundColor: '#E9ECEF' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  primaryTextOff: { color: '#9AA0A6' },

  // 모달 스타일
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', textAlign: 'center', paddingVertical: 16 },
  modalContent: { maxHeight: 560, paddingHorizontal: 16 },
  modalContentContainer: { paddingBottom: 16, paddingTop: 0 },
  modalImage: {
    width: '100%',
    height: undefined,
    borderWidth: 1,
    borderColor: '#C7D2DF',
    borderRadius: 8,
    alignSelf: 'center',
  },

  // 인증서 선택 바텀시트
  certOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  certSheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  certHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  certTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  certClose: { fontSize: 20, color: '#666' },
  certGrid: { flexDirection: 'row', gap: 12 },
  certItem: { flex: 1, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, alignItems: 'center', position: 'relative' },
  certItemSelected: { borderColor: '#2383BD' },
  certIcon: { width: 48, height: 48, marginBottom: 8 },
  certLabel: { fontSize: 14, color: '#333' },
  certCheck: { position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#2383BD', alignItems: 'center', justifyContent: 'center' },
  certCheckText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  section: { marginBottom: 16 },
  sectionTitle: { fontWeight: '700', color: '#333', marginBottom: 8 },
  tableBox: { height: 120, borderWidth: 1, borderColor: '#C7D2DF', borderRadius: 8, backgroundColor: '#F7FAFF' },
  modalConfirm: { backgroundColor: '#2383BD', alignItems: 'center', paddingVertical: 13.5 },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

