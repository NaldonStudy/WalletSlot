import { Spacing, Typography } from '@/src/constants/theme';
import type { ReportPeriod } from '@/src/types/report';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SpendingReportHeaderProps {
  period: ReportPeriod;
  theme: any;
}

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
    fontSize: Typography.fontSize.base, // 크기 증가
    fontWeight: Typography.fontWeight.bold, // 더 굵게
    lineHeight: Math.round(Typography.fontSize.base * Typography.lineHeight.normal),
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  lineHeight: Math.round(Typography.fontSize['2xl'] * Typography.lineHeight.normal),
    width: '100%',
    paddingHorizontal: 0,
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