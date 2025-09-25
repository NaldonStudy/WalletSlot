import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Modal, Pressable, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = { visible: boolean; onClose: () => void }

export default function TermsOfService({ visible, onClose }: Props) {
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
          <ThemedText style={{ fontSize: 20, fontWeight: '700' }}>이용 약관</ThemedText>
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
          {/* 제목 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 22, fontWeight: '700', color: '#333', textAlign: 'center' }}>
              Wallet Slot 이용 약관
            </ThemedText>
          </View>

          {/* 제1조 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>제1조 (목적)</ThemedText>
            <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333' }}>
              이 약관은 Wallet Slot(이하 &lsquo;회사&rsquo;)이 제공하는 Wallet Slot 애플리케이션 및 관련 제반 서비스(이하 &lsquo;서비스&rsquo;)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </ThemedText>
          </View>

          {/* 제2조 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>제2조 (용어의 정의)</ThemedText>
            <View style={{ marginLeft: 16 }}>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                1. 서비스: 회원이 보유한 금융 정보를 통합 조회하고, 이를 바탕으로 소비 패턴 분석 및 예산 관리(&lsquo;슬롯&rsquo;) 기능을 제공하는 Wallet Slot 애플리케이션을 의미합니다.
              </ThemedText>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                2. 회원: 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 의미합니다.
              </ThemedText>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                3. 마이데이터: 정보주체인 회원이 자신의 개인신용정보에 대한 결정권을 행사하여, 여러 금융회사에 흩어져 있는 자신의 금융 정보를 회사가 제공하는 서비스를 통해 통합 조회하고 관리하는 것을 의미합니다.
              </ThemedText>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333' }}>
                4. 슬롯: 회원의 거래내역을 바탕으로 추천되거나 회원이 직접 설정하는 가상의 예산 관리 단위를 의미합니다.
              </ThemedText>
            </View>
          </View>

          {/* 제3조 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>제3조 (약관의 명시와 개정)</ThemedText>
            <View style={{ marginLeft: 16 }}>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                1. 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
              </ThemedText>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                2. 회사는 &lsquo;약관의 규제에 관한 법률&rsquo;, &lsquo;정보통신망 이용촉진 및 정보보호 등에 관한 법률&rsquo; 등 관련 법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
              </ThemedText>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333' }}>
                3. 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 제1항의 방식에 따라 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
              </ThemedText>
            </View>
          </View>

          {/* 제4조 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>제4조 (서비스의 제공 및 변경)</ThemedText>
            <View style={{ marginLeft: 16 }}>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                1. 회사는 다음과 같은 서비스를 제공합니다.
              </ThemedText>
              <View style={{ marginLeft: 16, marginBottom: 8 }}>
                <ThemedText style={{ fontSize: 14, lineHeight: 20, color: '#333', marginBottom: 4 }}>
                  • 마이데이터를 통한 은행 계좌, 신용카드 등 금융 정보 통합 조회 서비스
                </ThemedText>
                <ThemedText style={{ fontSize: 14, lineHeight: 20, color: '#333', marginBottom: 4 }}>
                  • 수집된 거래내역의 자동 분석 및 소비 패턴 리포트 제공 서비스
                </ThemedText>
                <ThemedText style={{ fontSize: 14, lineHeight: 20, color: '#333', marginBottom: 4 }}>
                  • 예산 설정을 위한 &lsquo;슬롯&rsquo; 추천, 생성 및 관리 서비스
                </ThemedText>
                <ThemedText style={{ fontSize: 14, lineHeight: 20, color: '#333', marginBottom: 4 }}>
                  • 설정된 예산 초과, 카드 대금 연체 위험 등 알림 서비스
                </ThemedText>
                <ThemedText style={{ fontSize: 14, lineHeight: 20, color: '#333' }}>
                  • 기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333' }}>
                2. 회사는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에 따라 제공하고 있는 전부 또는 일부 서비스를 변경할 수 있습니다.
              </ThemedText>
            </View>
          </View>

          {/* 제5조 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>제5조 (회원의 의무)</ThemedText>
            <View style={{ marginLeft: 16 }}>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                1. 회원은 다음 행위를 하여서는 안 됩니다.
              </ThemedText>
              <View style={{ marginLeft: 16, marginBottom: 8 }}>
                <ThemedText style={{ fontSize: 14, lineHeight: 20, color: '#333', marginBottom: 4 }}>
                  • 서비스 이용 신청 또는 개인정보 변경 시 허위 내용의 등록
                </ThemedText>
                <ThemedText style={{ fontSize: 14, lineHeight: 20, color: '#333', marginBottom: 4 }}>
                  • 타인의 정보 도용
                </ThemedText>
                <ThemedText style={{ fontSize: 14, lineHeight: 20, color: '#333' }}>
                  • 회사의 운영을 방해하거나 서비스의 안정적 운영을 저해할 수 있는 모든 행위
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333' }}>
                2. 회원은 자신의 아이디와 비밀번호, 그리고 마이데이터 연동에 사용되는 인증서 등의 접근 매체를 스스로 관리할 책임이 있으며, 이를 제3자에게 양도하거나 이용하게 해서는 안 됩니다.
              </ThemedText>
            </View>
          </View>

          {/* 제6조 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>제6조 (마이데이터 관련 고지)</ThemedText>
            <View style={{ marginLeft: 16 }}>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                1. 본 서비스는 회원의 요청에 따라 각 금융기관에 등록된 회원의 금융 정보를 마이데이터 API를 통해 있는 그대로 가져와 보여주는 역할을 수행합니다.
              </ThemedText>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                2. 회사는 전송받은 정보의 정확성이나 완전성을 보증하지 않으며, 정보의 오류로 인해 발생한 손해에 대해서는 해당 정보를 생성한 금융기관에 책임이 있습니다.
              </ThemedText>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333' }}>
                3. 회원은 마이데이터 연동에 필요한 인증 정보(공동인증서, 간편인증 등)의 유출로 인해 발생할 수 있는 피해에 대해 스스로 주의를 기울여야 합니다.
              </ThemedText>
            </View>
          </View>

          {/* 제7조 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>제7조 (서비스의 책임 제한 - 면책 조항)</ThemedText>
            <View style={{ marginLeft: 16 }}>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                1. 본 서비스가 제공하는 모든 정보와 분석 결과는 회원의 합리적인 금융 생활을 돕기 위한 정보 제공을 목적으로 하며, 특정 금융 상품의 가입을 권유하거나 투자를 자문하는 것이 아닙니다.
              </ThemedText>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                2. 서비스를 통해 제공된 정보를 바탕으로 한 회원의 모든 금융적 결정(예: 지출, 저축, 투자 등)에 대한 최종적인 책임은 회원 본인에게 있습니다.
              </ThemedText>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333' }}>
                3. 회사는 천재지변, 각 금융기관의 서비스 장애, 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </ThemedText>
            </View>
          </View>

          {/* 제8조 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>제8조 (준거법 및 재판관할)</ThemedText>
            <View style={{ marginLeft: 16 }}>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333', marginBottom: 8 }}>
                1. 회사와 회원 간에 제기된 소송은 대한민국법을 준거법으로 합니다.
              </ThemedText>
              <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333' }}>
                2. 회사와 회원 간 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제소합니다.
              </ThemedText>
            </View>
          </View>

          {/* 부칙 */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 12 }}>부칙</ThemedText>
            <ThemedText style={{ fontSize: 14, lineHeight: 22, color: '#333' }}>
              본 약관은 2025년 9월 29일부터 시행됩니다.
            </ThemedText>
          </View>

        </ScrollView>
      </ThemedView>
    </Modal>
  )
}