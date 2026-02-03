// src/components/report/PeerComparison.tsx

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

export const PeerComparisonCard: React.FC<PeerComparisonProps> = ({
  peerComparison,
  theme
}) => {
  const formatCurrency = (amount: number) => {
    return `${Math.round(amount / 10000)}만원`;
  };

  // peerComparison이 null 또는 undefined일 경우를 대비하여 기본값을 설정합니다.
  // demographicInfo는 null, categories는 빈 배열([])을 기본값으로 하여 에러를 방지합니다.
  const { demographicInfo = null, categories = [] } = peerComparison || {};

  const genderLabel = demographicInfo?.gender ? (demographicInfo.gender === 'M' ? '남성' : '여성') : '정보 없음';
  const ageLabel = demographicInfo?.ageGroup ? demographicInfo.ageGroup : '연령 정보 없음';
  const incomeLabel = demographicInfo?.incomeRange ? demographicInfo.incomeRange : '소득 정보 없음';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        또래 비교
      </Text>
      
      <Text style={[styles.demographicText, { color: theme.colors.text.secondary }]}>
        {genderLabel} · {ageLabel} · {incomeLabel}
      </Text>

      {/* categories가 빈 배열일 경우 map 함수는 에러 없이 실행되지 않습니다. */}
      {categories.length > 0 ? categories.map((category, index) => {
        const isHigher = category.comparisonPercent > 100;
        
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
      }) : (
        <Text style={{ color: theme.colors.text.secondary }}>또래 비교 데이터가 없습니다.</Text>
      )}
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