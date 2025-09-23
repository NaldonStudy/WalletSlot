import { ThemedText } from '@/components/ThemedText';
import { useSignupStore } from '@/src/store/signupStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function MyDataConsentScreen() {
  const router = useRouter();
  const { name } = useSignupStore();

  const [showDoc1, setShowDoc1] = useState(false); // 전송요구서
  const [showDoc2, setShowDoc2] = useState(false); // 수집/이용 동의
  const [showDoc3, setShowDoc3] = useState(false); // 제공 동의

  const [agree1, setAgree1] = useState(false); // 수집/이용 (필수)
  const [agree2, setAgree2] = useState(false); // 제공 (필수)

  const canProceed = agree1 && agree2;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        <ThemedText style={styles.title}>{name || '사용자'}님의 계좌를 불러오기 위해 필요해요</ThemedText>

        {/* 전송요구서 요약 */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>전송요구서 (가입상품 목록, 상세정보)</ThemedText>
          <View style={styles.paperPreview} />
          <TouchableOpacity onPress={() => setShowDoc1(true)}>
            <ThemedText style={styles.link}>자세히 보기</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 수집/이용 동의서 (필수) */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>개인(신용)정보 수집·이용 동의서 (필수)</ThemedText>
          <View style={styles.paperPreview} />
          <TouchableOpacity onPress={() => setShowDoc2(true)}>
            <ThemedText style={styles.link}>자세히 보기</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkRow} onPress={() => setAgree1(!agree1)}>
            <View style={[styles.checkbox, agree1 && styles.checkboxOn]} />
            <ThemedText style={styles.checkText}>상기 내용을 확인하였으며 개인(신용)정보 수집·이용에 동의합니다.</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 제공 동의서 (필수) */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>개인(신용)정보 제공 동의서 (필수)</ThemedText>
          <View style={styles.paperPreview} />
          <TouchableOpacity onPress={() => setShowDoc3(true)}>
            <ThemedText style={styles.link}>자세히 보기</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkRow} onPress={() => setAgree2(!agree2)}>
            <View style={[styles.checkbox, agree2 && styles.checkboxOn]} />
            <ThemedText style={styles.checkText}>상기 내용을 확인하였으며 개인(신용)정보 제공에 동의합니다.</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.bottom}>
        <TouchableOpacity
          disabled={!canProceed}
          style={[styles.primaryBtn, canProceed ? styles.primaryOn : styles.primaryOff]}
          onPress={() => router.back()}
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
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  card: {
    borderWidth: 1, borderColor: '#E6EAF0', borderRadius: 12, padding: 16, backgroundColor: '#fff', marginBottom: 16,
  },
  cardTitle: { fontWeight: '700', color: '#333', marginBottom: 12 },
  paperPreview: { height: 160, borderRadius: 8, backgroundColor: '#F3F6FA', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  link: { color: '#2383BD', fontWeight: '600' },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C9D1D9' },
  checkboxOn: { backgroundColor: '#2383BD', borderColor: '#2383BD' },
  checkText: { marginLeft: 10, color: '#4B5563' },

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
  section: { marginBottom: 16 },
  sectionTitle: { fontWeight: '700', color: '#333', marginBottom: 8 },
  tableBox: { height: 120, borderWidth: 1, borderColor: '#C7D2DF', borderRadius: 8, backgroundColor: '#F7FAFF' },
  modalConfirm: { backgroundColor: '#2383BD', alignItems: 'center', paddingVertical: 14 },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

