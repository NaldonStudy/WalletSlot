// src/components/report/PersonalizedInsight.tsx

import { Spacing, Typography } from '@/src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PersonalizedInsight {
  aiSummary: string | null;
  aiActionItems: string[];
  notes: string[];
}

interface PersonalizedInsightProps {
  /** AI 기반 개인화 인사이트 데이터 */
  personalizedInsight: PersonalizedInsight;
  /** 앱 테마 객체 (라이트/다크 모드 색상 포함) */
  theme: any;
}

/**
 * ✨ API 데이터 기반으로 UI를 재구성한 개인화 인사이트 카드
 */
export const PersonalizedInsightCard: React.FC<PersonalizedInsightProps> = ({
  personalizedInsight,
  theme,
}) => {
  // 데이터가 null일 경우를 대비하여 기본값 설정
  const { aiSummary, aiActionItems, notes } = personalizedInsight || {};

  const hasActionItems = aiActionItems && aiActionItems.length > 0;
  const hasNotes = notes && notes.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.secondary }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        AI 인사이트 ✨
      </Text>

      {/* aiSummary가 있을 경우에만 표시 */}
      {aiSummary && (
        <View style={styles.insightSection}>
          <Text style={[styles.insightSummary, { color: theme.colors.text.secondary }]}>{aiSummary}</Text>
        </View>
      )}

      {/* aiActionItems가 있을 경우에만 목록으로 표시 */}
      {hasActionItems && (
        <View style={styles.insightSection}>
          <Text style={[styles.insightSubtitle, { color: theme.colors.text.primary }]}>💡 실천해 보세요</Text>
          {aiActionItems.map((item: string, index: number) => (
            <View key={index} style={styles.insightActionItem}>
              <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.primary[500]} style={{ marginRight: Spacing.sm, marginTop: 2 }} />
              <Text style={[styles.insightText, { color: theme.colors.text.primary }]}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* notes가 있을 경우에만 참고 항목으로 표시 */}
      {hasNotes && (
        <View style={styles.insightSection}>
           <Text style={[styles.insightSubtitle, { color: theme.colors.text.secondary }]}>📄 참고</Text>
          {notes.map((note: string, index: number) => (
            <Text key={index} style={[styles.insightNote, { color: theme.colors.text.secondary }]}>- {note}</Text>
          ))}
        </View>
      )}

      {/* 모든 인사이트 데이터가 없는 경우 안내 문구 표시 */}
      {!aiSummary && !hasActionItems && !hasNotes && (
         <Text style={{ color: theme.colors.text.secondary, marginTop: Spacing.sm }}>생성된 인사이트가 없습니다.</Text>
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
  // ✨ 새로운 UI에 맞는 스타일 추가/수정
  insightSection: {
    marginTop: Spacing.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEEEEE',
    paddingTop: Spacing.base,
  },
  insightSubtitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  insightSummary: {
    fontSize: Typography.fontSize.base,
    lineHeight: 22,
  },
  insightActionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: Spacing.sm,
  },
  insightText: {
    flex: 1, // 텍스트가 길어질 경우 줄바꿈되도록
    fontSize: Typography.fontSize.base,
    lineHeight: 22,
  },
  insightNote: {
    fontSize: Typography.fontSize.sm,
    lineHeight: 18,
  },
});