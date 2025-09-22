import { Spacing, Typography } from '@/src/constants/theme';
import type { CategorySpending } from '@/src/types/report';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CategoryAnalysisProps {
  /** 카테고리별 지출 분석 데이터 배열 */
  categoryAnalysis: CategorySpending[];
  /** 앱 테마 객체 (라이트/다크 모드 색상 포함) */
  theme: any;
}

/**
 * 슬롯(카테고리)별 예산 사용 현황을 분석하는 컴포넌트
 * 
 * 주요 기능:
 * - 각 슬롯의 예산 대비 실제 지출 비교
 * - 상태별 색상 구분 (절약/딱맞음/초과)
 * - 지출 비율을 프로그레스 바로 시각화
 * - 지난 기간 대비 변화율 표시
 * 
 * @param categoryAnalysis - 카테고리별 지출 분석 데이터
 * @param theme - 테마 설정
 */
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
    overflow: 'visible',
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
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  categoryAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
    // flexShrink 제거 - 텍스트가 자연스럽게 확장되도록
  },
  changePercent: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'right',
    marginLeft: Spacing.sm,
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