import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Spacing, themes, Typography } from '@/src/constants/theme';

type UncategorizedSlotCardProps = {
    remain: number;
    unreadCount: number;
}


export const UncategorizedSlotCard = ({ remain, unreadCount }: UncategorizedSlotCardProps) => {
    const colorScheme = useColorScheme() ?? "light";
    const theme = themes[colorScheme];
  
    return (
      <View
        style={[
          styles.card,
          theme.shadows.base,
          { backgroundColor: theme.colors.background.primary },
        ]}
      >
        {/* 하단 row: 왼쪽 타이틀+뱃지, 오른쪽 잔액 */}
        <View style={styles.bottomRow}>
          <View style={styles.left}>
            <Text style={[styles.name, { color: theme.colors.text.primary }]}>
              미분류 금액
            </Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
  
          <Text style={[styles.amount, { color: theme.colors.text.primary }]}>
            {remain.toLocaleString()}원
          </Text>
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    card: {
      marginHorizontal: Spacing.base,
      marginTop: Spacing.sm,
      borderRadius: 12,
      padding: Spacing.base,
      width: "100%",
      minHeight: 80, // 카드 높이 확보
      justifyContent: "flex-end", // 하단에 row 붙이기
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
    },
    name: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.medium,
    },
    badge: {
      marginLeft: Spacing.xs,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "red",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },
    badgeText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
    },
    amount: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
    },
  });