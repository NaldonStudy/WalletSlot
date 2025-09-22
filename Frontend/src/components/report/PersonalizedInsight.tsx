import { Spacing, Typography } from '@/src/constants/theme';
import type { PersonalizedInsight } from '@/src/types/report';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PersonalizedInsightProps {
  /** AI 기반 개인화 인사이트 데이터 */
  personalizedInsight: PersonalizedInsight;
  /** 앱 테마 객체 (라이트/다크 모드 색상 포함) */
  theme: any;
}

/**
 * 사용자 개인의 소비 패턴을 분석한 인사이트를 제공하는 카드 컴포넌트
 * 
 * 주요 기능:
 * - 개인 소비 유형 분석 및 설명
 * - 새로 발견된 소비 카테고리 하이라이트
 * - 긍정적 소비 습관 칭찬 (강점)
 * - 개선 필요한 소비 패턴 제안
 * - 색상 구분으로 직관적인 정보 전달
 * 
 * @param personalizedInsight - 개인화 인사이트 데이터
 * @param theme - 테마 설정
 */
export const PersonalizedInsightCard: React.FC<PersonalizedInsightProps> = ({
  personalizedInsight,
  theme,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        개인화 인사이트
      </Text>

      {/* 소비 유형 */}
      <View style={[styles.spendingTypeContainer, { backgroundColor: '#E0F2FE' }]}>
        <Text style={[styles.spendingTypeLabel, { color: theme.colors.text.secondary }]}>
          당신의 소비 유형
        </Text>
        <Text style={[styles.spendingType, { color: '#0369A1' }]}>
          {personalizedInsight.spendingType}
        </Text>
        <View>
          <Text
            style={[styles.spendingTypeDescription, { color: theme.colors.text.secondary }]}
          >
            {personalizedInsight.spendingTypeDescription}
          </Text>
        </View>
      </View>

      {/* 신규 카테고리 발견 */}
      <View style={[styles.newCategoryContainer, { backgroundColor: '#F0FDF4' }]}>
        <Text style={[styles.newCategoryLabel, { color: theme.colors.text.secondary }]}>
          신규 카테고리 발견
        </Text>
        <Text style={[styles.newCategoryTitle, { color: '#16A34A' }]}>
          온라인 강의
        </Text>
        <View>
          <Text
            style={[styles.newCategoryDescription, { color: theme.colors.text.secondary }]}
          >
            새로운 소비 패턴이 발견되었어요. 온라인 교육에 투자하고 계시는군요!
          </Text>
        </View>
      </View>

      {/* 강점들 */}
      {personalizedInsight.strengths.length > 0 && (
        <View style={styles.insightSection}>
          <Text style={[styles.insightSectionTitle, { color: '#16A34A' }]}>
            잘하고 있어요! 👍
          </Text>
          {personalizedInsight.strengths.map((strength, index) => (
            <View key={index}>
              <Text style={[styles.insightItem, { color: theme.colors.text.secondary }]}>
                • {strength}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* 개선점들 */}
      {personalizedInsight.improvements.length > 0 && (
        <View style={styles.insightSection}>
          <Text style={[styles.insightSectionTitle, { color: '#DC2626' }]}>
            개선해 보세요 💪
          </Text>
          {personalizedInsight.improvements.map((improvement, index) => (
            <View key={index}>
              <Text style={[styles.insightItem, { color: theme.colors.text.secondary }]}>
                • {improvement}
              </Text>
            </View>
          ))}
        </View>
      )}
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
  spendingTypeContainer: {
    padding: Spacing.base,
    borderRadius: 12,
    marginBottom: Spacing.base,
  },
  spendingTypeLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  spendingType: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  spendingTypeDescription: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Math.round(Typography.fontSize.base * Typography.lineHeight.normal),
  },
  newCategoryContainer: {
    padding: Spacing.base,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  newCategoryLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  newCategoryTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  newCategoryDescription: {
    fontSize: Typography.fontSize.sm,
    lineHeight: Math.round(Typography.fontSize.sm * Typography.lineHeight.normal),
  },
  insightSection: {
    marginBottom: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  insightSectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  insightItem: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Math.round(Typography.fontSize.base * Typography.lineHeight.relaxed),
    marginBottom: Spacing.sm,
  },
});