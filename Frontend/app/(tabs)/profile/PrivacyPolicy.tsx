import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Modal, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = { visible: boolean; onClose: () => void }

export default function PrivacyPolicy({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <View style={{ 
          padding: 18, 
          borderBottomWidth: 1, 
          borderColor: '#f0f0f0', 
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'relative' 
        }}>
          <ThemedText style={{ fontSize: 20, fontWeight: '700' }}>개인정보 처리방침</ThemedText>
          <Pressable onPress={onClose} style={{ position: 'absolute', left: 18 }} accessibilityLabel="뒤로">
            <Ionicons name="chevron-back" size={24} color="#333" />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 서문 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 16, lineHeight: 24, color: '#333' }}>
              Wallet Slot은 ｢신용정보의 이용 및 보호에 관한 법률｣, ｢개인정보 보호법｣ 등 관련 법령에 따라 다음과 같이 귀하의 개인(신용)정보를 처리합니다.
            </ThemedText>
          </View>

          {/* 수집·이용 목적 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>수집･이용 목적</ThemedText>
            
            <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8, marginBottom: 8 }}>
                <ThemedText style={{ fontSize: 14, fontWeight: '600', color: '#666', flex: 1 }}>가입상품 목록</ThemedText>
                <ThemedText style={{ fontSize: 14, color: '#333', flex: 2 }}>상세정보 전송요구를 위한 가입상품목록 조회</ThemedText>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <ThemedText style={{ fontSize: 14, fontWeight: '600', color: '#666', flex: 1 }}>상세정보</ThemedText>
                <ThemedText style={{ fontSize: 14, color: '#333', flex: 2 }}>전송요구를 통한 본인신용정보 통합조회, 데이터분석 서비스의 이용</ThemedText>
              </View>
            </View>
          </View>

          {/* 보유 및 이용기간 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>보유 및 이용기간</ThemedText>
            
            <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 8, marginBottom: 8 }}>
                <ThemedText style={{ fontSize: 14, fontWeight: '600', color: '#666', flex: 1 }}>가입상품 목록</ThemedText>
                <ThemedText style={{ fontSize: 14, color: '#333', flex: 2 }}>상세정보 전송요구시까지 또는 7일 중 짧은 기간</ThemedText>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <ThemedText style={{ fontSize: 14, fontWeight: '600', color: '#666', flex: 1 }}>상세정보</ThemedText>
                <ThemedText style={{ fontSize: 14, color: '#333', flex: 2 }}>서비스 이용 종료시 또는 삭제요구시 까지</ThemedText>
              </View>
            </View>
          </View>

          {/* 거부 권리 및 불이익 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>거부 권리 및 불이익</ThemedText>
            <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 16 }}>
              귀하는 개인(신용)정보 수집･이용에 관한 동의를 거부하실 수 있습니다. 
              다만, "수집･이용에 관한 동의", "필수 항목에 대한 수집･이용에 관한 동의"는 본인신용정보 통합조회, 데이터분석 서비스의 이용을 위한 필수적 사항이므로 동의를 거부하실 경우 본인신용정보 통합조회, 데이터분석 서비스의 이용이 제한될 수 있습니다.
            </ThemedText>
          </View>

          {/* 수집·이용 항목 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>※ 수집･이용 항목</ThemedText>
            
            <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <View style={{ marginBottom: 16 }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>개인(식별)정보</ThemedText>
                <ThemedText style={{ fontSize: 14, color: '#666' }}>전자서명, 접근토큰, 인증서, 전송요구서</ThemedText>
              </View>
              
              <View style={{ marginBottom: 16 }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>가입상품 목록</ThemedText>
                <ThemedText style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
                  수신계좌목록 : 고객정보 최초생성일시, 적요 정보 전송요구 여부, 계좌번호, 회차번호, 상품명, 외화계좌여부, 마이너스 약정 여부, 계좌번호 별 구분 코드, 계좌번호 별 상태 코드
                </ThemedText>
              </View>
              
              <View>
                <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 }}>상세정보</ThemedText>
                <ThemedText style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
                  수신계좌 : 계좌기본정보(저축방법, 계좌개설일자, 만기일, 통화코드, 약정액, 월 납입액), 계좌잔액정보 (통화코드, 현재 잔액, 출금 가능액, 계약금리, 최종납입회차), 거래내역(거래 일시 또는 거래일자, 거래번호, 거래유형 (코드), 거래구분, 통화코드, 거래금액, 거래 후 잔액, 납입회차)
                </ThemedText>
              </View>
            </View>
          </View>

        </ScrollView>
      </ThemedView>
    </Modal>
  )
}