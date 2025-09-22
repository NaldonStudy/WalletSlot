import { Spacing, Typography } from '@/src/constants/theme';
import type { TopSpendingCategory } from '@/src/types/report';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TopSpendingChartProps {
  topSpendingCategories: TopSpendingCategory[];
  theme: any;
}

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
    overflow: 'visible', // 내용이 잘리지 않도록
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
    fontSize: Typography.fontSize.sm, // 크기 증가
    textAlign: 'center',
    fontWeight: Typography.fontWeight.bold, // 더 굵게
  },
  detailsContainer: {
    marginTop: Spacing.base,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
    // minHeight 제거 - 텍스트에 따라 자동 높이
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
    // minHeight 제거 - 컨텐츠에 따라 동적 크기
  },
  detailName: {
    fontSize: Typography.fontSize.lg, // 크기 증가
    fontWeight: Typography.fontWeight.bold, // 더 굵게
  },
  detailAmount: {
    fontSize: Typography.fontSize.base, // 크기 증가
    fontWeight: Typography.fontWeight.medium, // 글꼴 두께 추가
  },
});