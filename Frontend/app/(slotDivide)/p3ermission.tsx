import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function P3ermissionScreen() {
  const handleGoBack = () => {
    // l2oading.tsx의 모달이 열린 상태로 돌아가기
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <ThemedText style={styles.backButtonText}>← 뒤로</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 필수 항목 1 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              [필수] 내 정보 수집·이용 동의
            </ThemedText>
            <View style={styles.detailContentContainer}>
              <ThemedText style={styles.sectionDescription}>
                월수입, 계좌/카드 거래내역, 소비 패턴을 수집해 자동 슬롯 추천과 맞춤형 분석에 사용합니다.
              </ThemedText>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>수집 항목</ThemedText>
                <ThemedText style={styles.detailContent}>
                  월수입 정보, 계좌 거래내역, 소비 패턴, (분석기간) 사용자가 선택한 기간의 거래내역
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>이용 목적</ThemedText>
                <ThemedText style={styles.detailContent}>
                  자동 슬롯 추천(예산 카테고리 생성), 개인 맞춤형 분석 및 관리 서비스 제공
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>보유 기간</ThemedText>
                <ThemedText style={styles.detailContent}>
                  서비스 이용 종료 시 또는 법령상 의무 보존 기간까지
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>동의 거부 시</ThemedText>
                <ThemedText style={styles.detailContent}>
                  서비스 제공이 제한될 수 있습니다.
                </ThemedText>
              </View>
            </View>
          </View>

          {/* 필수 항목 2 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              [필수] 제3자 제공 동의
            </ThemedText>
            <View style={styles.detailContentContainer}>
              <ThemedText style={styles.sectionDescription}>
                본인확인 및 데이터 연동을 위해 중계기관·제휴 금융사에 필요한 항목을 제공합니다.
              </ThemedText>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>제공받는 자</ThemedText>
                <ThemedText style={styles.detailContent}>
                  오픈뱅킹 중계기관, 금융결제원, 제휴 은행·카드사
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>제공 목적</ThemedText>
                <ThemedText style={styles.detailContent}>
                  본인확인 및 거래내역 연동, 슬롯 추천/분석 제공을 위한 데이터 중계
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>제공 항목</ThemedText>
                <ThemedText style={styles.detailContent}>
                  계좌번호(마스킹), 거래내역 요약, 소비 카테고리, 월수입 정보
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>보유 기간</ThemedText>
                <ThemedText style={styles.detailContent}>
                  제공 목적 달성 시 또는 법령상 의무 보존 기간까지
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>동의 거부 시</ThemedText>
                <ThemedText style={styles.detailContent}>
                  서비스 제공이 제한될 수 있습니다.
                </ThemedText>
              </View>
            </View>
          </View>

          {/* 선택 항목 */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              [선택] AI 모델 학습 활용 동의
            </ThemedText>
            <View style={styles.detailContentContainer}>
              <ThemedText style={styles.sectionDescription}>
                소비 데이터를 익명·통계 처리하여 모델을 고도화하고 추천 정확도를 개선합니다.
              </ThemedText>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>목적</ThemedText>
                <ThemedText style={styles.detailContent}>
                  익명·통계 처리된 데이터를 활용한 AI 모델 고도화 및 추천 정확도 개선
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>특이 사항</ThemedText>
                <ThemedText style={styles.detailContent}>
                  거래내역이 부족한 경우 유사 수입대-성별 집단 데이터를 참고해 슬롯을 추천할 수 있습니다.
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>처리 방식</ThemedText>
                <ThemedText style={styles.detailContent}>
                  가명·익명 처리 후 통계/머신러닝 학습에 사용하며 개인 식별은 불가합니다.
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>보유 기간</ThemedText>
                <ThemedText style={styles.detailContent}>
                  AI 학습 및 모델 고도화 완료 시 또는 관련 법령상 보존 기간까지
                </ThemedText>
              </View>
              
              <View style={styles.detailItem}>
                <ThemedText style={styles.detailLabel}>동의 거부 시</ThemedText>
                <ThemedText style={styles.detailContent}>
                  서비스 이용은 가능하나 추천 정확도 및 신규 기능 고도화에 일부 제한이 있을 수 있습니다.
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 30,
  },
  detailContentContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
    marginBottom: 15,
  },
  detailItem: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  detailContent: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
});
