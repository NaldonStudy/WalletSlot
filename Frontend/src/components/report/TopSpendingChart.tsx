import { Spacing, Typography } from '@/src/constants/theme';
import type { TopSpendingCategory } from '@/src/types/report';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TopSpendingChartProps {
  /** 상위 지출 카테고리 데이터 배열 (최대 3개) */
  topSpendingCategories: TopSpendingCategory[];
  /** 앱 테마 객체 (라이트/다크 모드 색상 포함) */
  theme: any;
}

/**
 * 상위 3대 지출 카테고리를 막대 차트로 시각화하는 컴포넌트
 * 
 * 주요 기능:
 * - 상위 3개 카테고리의 지출 금액을 막대 차트로 표시
 * - 각 카테고리별 색상 구분 (파랑, 빨강, 초록)
 * - 막대 차트 하단에 상세 정보 및 백분율 표시
 * - 반응형 차트 높이 (최대 지출 금액 기준 비례 조정)
 * 
 * @param topSpendingCategories - 상위 지출 카테고리 데이터
 * @param theme - 테마 설정
 */
export const TopSpendingChart: React.FC<TopSpendingChartProps> = ({
  topSpendingCategories,
  theme
}) => {
  const formatCurrency = (amount: number) => {
    return `${Math.round(amount / 10000)}만원`;
  };

  const maxAmount = Math.max(...topSpendingCategories.map(cat => cat.amount));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        상위 3대 지출 순위
      </Text>

      {/* 간단한 막대 차트 */}
      <View style={styles.chartContainer}>
        {topSpendingCategories.map((category, index) => {
          const barHeight = (category.amount / maxAmount) * 120; // 최대 높이 120
          const colors = ['#3B82F6', '#EF4444', '#10B981']; // 블루, 레드, 그린
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: barHeight,
                      backgroundColor: colors[index]
                    }
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: theme.colors.text.primary }]}>
                {category.categoryName}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 상세 정보 */}
      <View style={styles.detailsContainer}>
        {topSpendingCategories.map((category, index) => {
          const colors = ['#3B82F6', '#EF4444', '#10B981'];
          
          return (
            <View key={index} style={styles.detailItem}>
              <View style={[styles.colorIndicator, { backgroundColor: colors[index] }]} />
              <View style={styles.detailInfo}>
                <Text style={[styles.detailName, { color: theme.colors.text.primary }]}>
                  {category.categoryName}
                </Text>
                <Text style={[styles.detailAmount, { color: theme.colors.text.secondary }]}>
                  {formatCurrency(category.amount)} ({category.percentage}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    borderRadius: 16,
    overflow: 'visible',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.base,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: Spacing.sm,
  },
  bar: {
    width: 40,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.bold,
  },
  detailsContainer: {
    marginTop: Spacing.base,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  detailInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  detailAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
});