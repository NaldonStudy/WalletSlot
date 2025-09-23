import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Spacing } from "@/src/constants/theme";

type SlotInfoCardProps = {
  slotName: string;
  badgeText: string;
  badgeColor: string;
  currentBudget: number;
  currentRemaining: number;
  newBudget?: number;
  newRemaining?: number;
  showChanges?: boolean;
  isSaving?: boolean; // 저축 슬롯 여부
  theme: any;
};

export default function SlotInfoCard({
  slotName,
  badgeText,
  badgeColor,
  currentBudget,
  currentRemaining,
  newBudget,
  newRemaining,
  showChanges = false,
  isSaving = false,
  theme,
}: SlotInfoCardProps) {
  return (
    <View style={styles.slotInfoCard}>
      <View style={styles.slotInfoHeader}>
        <Text style={[styles.slotInfoTitle, { color: theme.colors.text.primary }]}>
          {slotName} 슬롯
        </Text>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      </View>
      <View style={styles.slotInfoDetails}>
        <View style={styles.slotInfoRow}>
          <Text style={[styles.slotInfoLabel, { color: theme.colors.text.secondary }]}>
            {isSaving ? '목표 금액' : '현재 예산'}
          </Text>
          <Text style={[styles.slotInfoValue, { color: theme.colors.text.primary }]}>
            {currentBudget.toLocaleString()}원
          </Text>
        </View>
        <View style={styles.slotInfoRow}>
          <Text style={[styles.slotInfoLabel, { color: theme.colors.text.secondary }]}>
            현재 잔액
          </Text>
          <Text style={[styles.slotInfoValue, { color: theme.colors.text.primary }]}>
            {currentRemaining.toLocaleString()}원
          </Text>
        </View>
        {showChanges && newBudget !== undefined && newRemaining !== undefined && (
          <>
            <View style={styles.slotInfoRow}>
              <Text style={[styles.slotInfoLabel, { color: theme.colors.text.secondary }]}>
                {isSaving ? '변경 후 목표 금액' : '변경 후 예산'}
              </Text>
              <Text style={[
                styles.slotInfoValue, 
                { 
                  color: newBudget > currentBudget 
                    ? '#059669' // 증가하면 초록색
                    : newBudget < currentBudget 
                      ? '#DC2626' // 감소하면 빨간색
                      : theme.colors.text.primary // 변화 없으면 기본색
                }
              ]}>
                {newBudget.toLocaleString()}원
              </Text>
            </View>
            <View style={styles.slotInfoRow}>
              <Text style={[styles.slotInfoLabel, { color: theme.colors.text.secondary }]}>
                변경 후 잔액
              </Text>
              <Text style={[
                styles.slotInfoValue, 
                { 
                  color: newRemaining > currentRemaining 
                    ? '#059669' // 증가하면 초록색
                    : newRemaining < currentRemaining 
                      ? '#DC2626' // 감소하면 빨간색
                      : theme.colors.text.primary // 변화 없으면 기본색
                }
              ]}>
                {newRemaining.toLocaleString()}원
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slotInfoCard: {
    marginBottom: Spacing.base,
    padding: Spacing.base,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  slotInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  slotInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  slotInfoDetails: {
    gap: Spacing.xs,
  },
  slotInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotInfoLabel: {
    fontSize: 14,
  },
  slotInfoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
