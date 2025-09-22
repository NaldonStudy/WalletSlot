import { Spacing, Typography } from '@/src/constants/theme';
import type { CategorySpending } from '@/src/types/report';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CategoryAnalysisProps {
  categoryAnalysis: CategorySpending[];
  theme: any;
}

export const CategoryAnalysis: React.FC<CategoryAnalysisProps> = ({
  categoryAnalysis,
  theme
}) => {
  const formatCurrency = (amount: number) => {
    return `${Math.round(amount / 10000)}만원`;
  };

  const getStatusLabel = (status: 'under' | 'optimal' | 'over') => {
    switch (status) {
      case 'optimal':
        return { label: '딱 맞음', color: '#10B981' };
      case 'over':
        return { label: '초과', color: '#EF4444' };
      case 'under':
        return { label: '절약', color: '#6B7280' };
    }
  };

  const getChangeColor = (percent: number) => {
    // + = 예산 대비 초과 지출 (나쁨), - = 예산 대비 절약 (좋음)
    if (percent > 0) return '#EF4444'; // 빨간색 (초과지출)
    if (percent < 0) return '#10B981'; // 초록색 (절약)
    return theme.colors.text.secondary;
  };

  const getChangeText = (percent: number) => {
    if (percent > 0) {
      return `+${percent}% 초과`;
    } else if (percent < 0) {
      return `${percent}% 절약`;
    } else {
      return '0% 변화없음';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        슬롯 분석
      </Text>

      {categoryAnalysis.map((category, index) => {
        const statusInfo = getStatusLabel(category.status);
        
        return (
          <View key={category.categoryId} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={[styles.categoryName, { color: theme.colors.text.primary }]}>
                {category.categoryName}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <Text style={styles.statusText}>{statusInfo.label}</Text>
              </View>
            </View>

            <View style={styles.categoryDetails}>
              <Text style={[styles.categoryAmount, { color: theme.colors.text.secondary }]}>
                예산: {formatCurrency(category.budgetAmount)}  |  
                사용: {formatCurrency(category.spentAmount)}
              </Text>
              
              <Text style={[styles.changePercent, { color: getChangeColor(category.changePercent) }]}>
                {getChangeText(category.changePercent)}
              </Text>
            </View>

            {/* 지출 비율 바 */}
            <View style={[styles.progressBar, { backgroundColor: theme.colors.background.tertiary }]}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    backgroundColor: statusInfo.color,
                    width: `${Math.min(category.spendingRatio * 100, 100)}%`
                  }
                ]}
              />
            </View>
          </View>
        );
      })}
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
  categoryItem: {
    marginBottom: Spacing.base,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: Spacing.sm,
    overflow: 'visible', // 텍스트가 잘리지 않도록
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: Typography.fontSize.lg, // 크기 증가
    fontWeight: Typography.fontWeight.bold, // 더 굵게
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: Typography.fontSize.sm, // 크기 증가
    fontWeight: Typography.fontWeight.bold, // 더 굵게
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
    // minHeight 제거 - 텍스트에 따라 자동 크기
  },
  categoryAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
    // flexShrink 제거 - 텍스트가 자연스럽게 확장되도록
  },
  changePercent: {
    fontSize: Typography.fontSize.base, // 크기 증가
    fontWeight: Typography.fontWeight.bold, // 더 굵게
    textAlign: 'right', // 우측 정렬
    marginLeft: Spacing.sm, // 좌측 여백
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});