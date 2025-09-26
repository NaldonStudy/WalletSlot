// src/components/report/SpendingReportHeader.tsx

import { Spacing, Typography } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ReportPeriod {
  startAt: string;
  endAt: string;
}

interface SpendingReportHeaderProps {
  /** 리포트 기간 정보 (시작일, 종료일) */
  period: ReportPeriod;
  /** 앱 테마 객체 (라이트/다크 모드 색상 포함) */
  theme: any;
}

/**
 * 지출 리포트 화면의 헤더 컴포넌트
 */
export const SpendingReportHeader: React.FC<SpendingReportHeaderProps> = ({
  period,
  theme
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return ''; // 날짜 문자열이 없는 경우 방어
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };
  
  const periodLabel = period?.startAt && period?.endAt
    ? `${formatDate(period.startAt)} - ${formatDate(period.endAt)}`
    : '기간 정보 없음';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.secondary },
      ]}
    >
      {/* 날짜 범위 */}
      <View style={styles.dateContainer}>
        <Text style={[styles.dateText, { color: theme.colors.text.secondary }]}>
          📅 {periodLabel}
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
      
      {/* 일러스트 영역 */}
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
    alignItems: 'center',
    width: '100%',
  },
  dateText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: Math.round(Typography.fontSize.base * Typography.lineHeight.normal),
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.xs,
    lineHeight: Math.round(Typography.fontSize.xl * Typography.lineHeight.tight),
    width: '100%',
    paddingHorizontal: 0,
    maxWidth: '100%',
    flexWrap: 'nowrap',
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