// src/components/report/BudgetSuggestion.tsx

import { Spacing, Typography } from '@/src/constants/theme';
import type { BudgetSuggestion } from '@/src/types/report';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BudgetSuggestionProps {
  /** AI 기반 예산 제안 데이터 */
  budgetSuggestion: BudgetSuggestion;
  /** 앱 테마 객체 (라이트/다크 모드 색상 포함) */
  theme: any;
}

export const BudgetSuggestionCard: React.FC<BudgetSuggestionProps> = ({
  budgetSuggestion,
  theme
}) => {
  // budgetSuggestion이 null 또는 undefined일 경우를 대비하여 기본값을 설정합니다.
  const { totalSuggested = 0, categories = [] } = budgetSuggestion || {};

  const formatCurrency = (amount: number) => {
    return `${Math.round(amount / 10000)}만원`;
  };

  // 제안 데이터가 아예 없는 경우를 위한 UI 처리
  if (!totalSuggested && categories.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: '#F3F4F6' }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          다음 달 예산 제안
        </Text>
        <Text style={{ color: theme.colors.text.secondary }}>
          이번 달에는 예산 제안이 없습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#FEF3CD' }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        다음 달 예산 제안
      </Text>

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
            식비 슬롯을 {formatCurrency(totalSuggested)}로 조정하세요
          </Text>
        </View>
      </View>

      <View style={styles.categorySuggestions}>
        {categories.map((category, index) => {
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
    alignSelf: 'stretch',
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
    overflow: 'visible',
  },
  suggestionIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  suggestionText: {
    flex: 1,
    paddingRight: Spacing.xs,
    justifyContent: 'flex-start',
  },
  suggestionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
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
    overflow: 'visible',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  budgetChange: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  categoryReason: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Math.round(Typography.fontSize.base * Typography.lineHeight.normal),
  },
});