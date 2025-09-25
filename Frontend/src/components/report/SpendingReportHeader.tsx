import { Spacing, Typography } from '@/src/constants/theme';
import type { ReportPeriod } from '@/src/types/report';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SpendingReportHeaderProps {
  /** 리포트 기간 정보 (시작일, 종료일) */
  period: ReportPeriod;
  /** 앱 테마 객체 (라이트/다크 모드 색상 포함) */
  theme: any;
}

/**
 * 지출 리포트 화면의 헤더 컴포넌트
 * 
 * 주요 기능:
 * - 리포트 기간 표시 (월/일 형식)
 * - 사용자 친화적인 리포트 제목 및 완료 상태 표시
 * - Safe Area를 고려한 상단 패딩 적용
 * - 일러스트 영역 제공 (향후 이미지 교체 가능)
 * 
 * @param period - 리포트 대상 기간
 * @param theme - 테마 설정
 */
export const SpendingReportHeader: React.FC<SpendingReportHeaderProps> = ({
  period,
  theme
}) => {
  const insets = useSafeAreaInsets();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.secondary, paddingTop: Spacing.lg + (insets.top ?? 0) },
      ]}
    >
      {/* 날짜 범위 */}
      <View style={styles.dateContainer}>
        <Text style={[styles.dateText, { color: theme.colors.text.secondary }]}>
          📅 {formatDate(period.startDate)} - {formatDate(period.endDate)}
        </Text>
      </View>

      {/* 메인 타이틀 */}
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        이번달 소비 레포트가 도착했어요!
      </Text>
      
      {/* 부제목 */}
      <Text style={[styles.subtitle, { color: theme.colors.primary[600] }]}>
        분석 완료됨
      </Text>
      
      {/* 일러스트 영역 (나중에 이미지로 교체 가능) */}
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>📊✨</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
    marginBottom: Spacing.base,
    borderRadius: 16,
    alignSelf: 'stretch',
    overflow: 'visible',
    alignItems: 'center',
  },
  dateContainer: {
    marginBottom: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center', // 날짜 텍스트 중앙 정렬
    width: '100%',
  },
  dateText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Math.round(Typography.fontSize.base * Typography.lineHeight.normal),
  },
  title: {
    fontSize: Typography.fontSize.xl, // 2xl에서 xl로 축소
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    lineHeight: Math.round(Typography.fontSize.xl * Typography.lineHeight.tight), // tight 라인 높이로 변경
    width: '100%',
    paddingHorizontal: 0,
    maxWidth: '100%',
    flexWrap: 'nowrap', // 텍스트 줄 바꿈 방지
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    width: '100%',
    lineHeight: Math.round(Typography.fontSize.base * Typography.lineHeight.normal),
  },
  illustrationContainer: {
    marginTop: Spacing.sm,
  },
  illustration: {
    fontSize: 32,
  },
});