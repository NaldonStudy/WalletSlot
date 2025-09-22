import { Spacing, Typography } from '@/src/constants/theme';
import type { PeerComparison } from '@/src/types/report';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PeerComparisonProps {
  /** 동일 연령/성별/소득대 그룹과의 비교 데이터 */
  peerComparison: PeerComparison;
  /** 앱 테마 객체 (라이트/다크 모드 색상 포함) */
  theme: any;
}

/**
 * 동일한 인구통계학적 그룹(연령, 성별, 소득) 내에서 사용자의 소비를 비교하는 컴포넌트
 * 
 * 주요 기능:
 * - 또래 그룹 정보 표시 (성별, 연령대, 소득 구간)
 * - 카테고리별 내 지출 vs 그룹 평균 비교
 * - 비교 백분율 표시 (100% 기준 초과/미만 색상 구분)
 * - 시각적 비교 바로 지출 차이 직관적 표현
 * 
 * @param peerComparison - 또래 비교 데이터
 * @param theme - 테마 설정
 */
export const PeerComparisonCard: React.FC<PeerComparisonProps> = ({
  peerComparison,
  theme
}) => {
  const formatCurrency = (amount: number) => {
    return `${Math.round(amount / 10000)}만원`;
  };

  const { demographicInfo } = peerComparison;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        또래 비교
      </Text>
      
      <Text style={[styles.demographicText, { color: theme.colors.text.secondary }]}>
        {demographicInfo.gender === 'M' ? '남성' : '여성'} · {demographicInfo.ageGroup} 중반 · {demographicInfo.incomeRange}
      </Text>

      {peerComparison.categories.map((category, index) => {
        const isHigher = category.comparisonPercent > 100;
        const percentage = Math.abs(category.comparisonPercent - 100);
        
        return (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={[styles.categoryName, { color: theme.colors.text.primary }]}>
                {category.categoryName}
              </Text>
              <View style={[
                styles.comparisonBadge, 
                { backgroundColor: isHigher ? '#FEE2E2' : '#F0FDF4' }
              ]}>
                <Text style={[
                  styles.comparisonText,
                  { color: isHigher ? '#DC2626' : '#16A34A' }
                ]}>
                  {category.comparisonPercent}%
                </Text>
              </View>
            </View>

            <View style={styles.amountComparison}>
              <View style={styles.amountItem}>
                <Text style={[styles.amountLabel, { color: theme.colors.text.secondary }]}>
                  내 지출: {formatCurrency(category.mySpending)}
                </Text>
              </View>
              <View style={styles.amountItem}>
                <Text style={[styles.amountLabel, { color: theme.colors.text.secondary }]}>
                  평균: {formatCurrency(category.peerAverage)}
                </Text>
              </View>
            </View>

            {/* 비교 바 */}
            <View style={styles.comparisonBarContainer}>
              <View style={[styles.comparisonBar, { backgroundColor: theme.colors.background.tertiary }]}>
                <View 
                  style={[
                    styles.mySpendingBar,
                    { 
                      backgroundColor: isHigher ? '#EF4444' : '#10B981',
                      width: `${Math.min((category.mySpending / Math.max(category.mySpending, category.peerAverage)) * 100, 100)}%`
                    }
                  ]}
                />
              </View>
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
    marginBottom: Spacing.xs,
  },
  demographicText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.lg,
  },
  categoryItem: {
    marginBottom: Spacing.base,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: Spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  comparisonBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comparisonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  amountComparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  amountItem: {
    flex: 1,
    paddingRight: Spacing.xs,
    // minWidth 제거 - 내용에 따라 자연스럽게 크기 조정
  },
  amountLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  comparisonBarContainer: {
    marginTop: Spacing.xs,
  },
  comparisonBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'visible',
  },
  mySpendingBar: {
    height: '100%',
    borderRadius: 4,
  },
});