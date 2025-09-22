import { Spacing, Typography } from '@/src/constants/theme';
import type { BudgetSuggestion } from '@/src/types/report';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BudgetSuggestionProps {
  budgetSuggestion: BudgetSuggestion;
  theme: any;
}

export const BudgetSuggestionCard: React.FC<BudgetSuggestionProps> = ({
  budgetSuggestion,
  theme
}) => {
  const formatCurrency = (amount: number) => {
    return `${Math.round(amount / 10000)}만원`;
  };

  return (
    <View style={[styles.container, { backgroundColor: '#FEF3CD' }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        다음 달 예산 제안
      </Text>

      {/* 전체 제안 예산 */}
      <View style={styles.totalSuggestionContainer}>
        <Text style={[styles.suggestionIcon, { color: theme.colors.text.primary }]}>
          💡
        </Text>
        <View style={styles.suggestionText}>
          <Text style={[styles.suggestionTitle, { color: theme.colors.text.primary }]}>
            예산 조정 권유
          </Text>
          <Text 
            style={[styles.suggestionAmount, { color: theme.colors.text.secondary }]}
          >
            식비 슬롯을 {formatCurrency(budgetSuggestion.totalSuggested)}로 조정하세요
          </Text>
        </View>
      </View>

      {/* 카테고리별 제안 */}
      <View style={styles.categorySuggestions}>
        {budgetSuggestion.categories.map((category, index) => {
          const difference = category.suggestedBudget - category.currentBudget;
          const isIncrease = difference > 0;
          
          return (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryName, { color: theme.colors.text.primary }]}>
                  {category.categoryName}
                </Text>
                <Text style={[
                  styles.budgetChange,
                  { color: isIncrease ? '#EF4444' : '#10B981' }
                ]}>
                  {isIncrease ? '+' : ''}{formatCurrency(difference)}
                </Text>
              </View>
              <Text 
                style={[styles.categoryReason, { color: theme.colors.text.secondary }]}
              >
                {category.reason}
              </Text>
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
    alignSelf: 'stretch', // 컨테이너가 가능한 공간을 모두 사용
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.base,
  },
  totalSuggestionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: Spacing.base,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    overflow: 'visible', // 내용이 잘리지 않도록
  },
  suggestionIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  suggestionText: {
    flex: 1,
    paddingRight: Spacing.xs,
    justifyContent: 'flex-start', // 텍스트가 위에서부터 시작
  },
  suggestionTitle: {
    fontSize: Typography.fontSize.lg, // 크기 증가
    fontWeight: Typography.fontWeight.bold, // 더 굵게
    marginBottom: Spacing.xs,
  },
  suggestionAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Math.round(Typography.fontSize.base * Typography.lineHeight.relaxed),
  },
  categorySuggestions: {
    marginTop: Spacing.sm,
  },
  categoryItem: {
    marginBottom: Spacing.base,
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
  budgetChange: {
    fontSize: Typography.fontSize.base, // 크기 증가
    fontWeight: Typography.fontWeight.bold, // 더 굵게
  },
  categoryReason: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Math.round(Typography.fontSize.base * Typography.lineHeight.normal),
  },
});