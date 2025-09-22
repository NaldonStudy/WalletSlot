import { Spacing, Typography } from '@/src/constants/theme';
import type { BudgetComparison } from '@/src/types/report';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BudgetOverviewProps {
  budgetComparison: BudgetComparison;
  theme: any;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budgetComparison,
  theme
}) => {
  const formatCurrency = (amount: number) => {
    return `${Math.round(amount / 10000)}만원`;
  };

  const formatChangePercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent}%`;
  };

  const getChangeColor = () => {
    if (budgetComparison.changePercent > 0) {
      return '#EF4444'; // 증가 - 빨간색
    } else if (budgetComparison.changePercent < 0) {
      return '#10B981'; // 감소 - 초록색
    }
    return theme.colors.text.secondary; // 변화 없음
  };

  const spentRatio = budgetComparison.totalSpent / budgetComparison.totalBudget;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        이번 달 통계
      </Text>

      {/* 거래 횟수와 증감률 */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.text.primary }]}>
            {budgetComparison.transactionCount}회
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
            총 결제
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.changePercent, { color: getChangeColor() }]}>
            {formatChangePercent(budgetComparison.changePercent)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
            지난 달 대비
          </Text>
        </View>
      </View>

      {/* 예산 vs 지출 비교 바 */}
      <View style={styles.budgetBarContainer}>
        <View style={styles.budgetLabels}>
          <Text style={[styles.budgetLabel, { color: theme.colors.text.secondary }]}>
            예산
          </Text>
          <Text style={[styles.budgetAmount, { color: theme.colors.text.primary }]}>
            {formatCurrency(budgetComparison.totalBudget)}
          </Text>
        </View>
        
        {/* 예산 바 (배경) */}
        <View style={[styles.budgetBar, { backgroundColor: theme.colors.background.tertiary }]}>
          {/* 지출 바 (전경) */}
          <View 
            style={[
              styles.spentBar, 
              { 
                backgroundColor: spentRatio > 1 ? '#EF4444' : theme.colors.primary[500],
                width: `${Math.min(spentRatio * 100, 100)}%`
              }
            ]} 
          />
        </View>
        
        <View style={styles.budgetLabels}>
          <Text style={[styles.budgetLabel, { color: theme.colors.text.secondary }]}>
            실제 사용
          </Text>
          <Text style={[styles.budgetAmount, { color: spentRatio > 1 ? '#EF4444' : theme.colors.text.primary }]}>
            {formatCurrency(budgetComparison.totalSpent)}
          </Text>
        </View>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
    alignItems: 'flex-start',
    // minHeight 제거 - 텍스트 내용에 따라 동적 높이
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Spacing.xs,
    // minHeight 제거 - 텍스트에 맞게 자동 조정
  },
  statNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  changePercent: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium, // 글꼴 두께 추가
  },
  budgetBarContainer: {
    marginTop: Spacing.base,
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    flexWrap: 'wrap',
    // minHeight 제거 - 라벨 내용에 따라 자동 크기
  },
  budgetLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium, // 글꼴 두께 추가
  },
  budgetAmount: {
    fontSize: Typography.fontSize.lg, // 크기 증가
    fontWeight: Typography.fontWeight.bold, // 더 굵게
  },
  budgetBar: {
    height: 12,
    borderRadius: 6,
    marginVertical: Spacing.xs,
    overflow: 'visible',
  },
  spentBar: {
    height: '100%',
    borderRadius: 6,
  },
});