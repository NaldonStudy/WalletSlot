import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { themes } from "@/src/constants/theme";
import { useUncategorizedNotificationCount } from '@/src/hooks/notifications/useUncategorizedNotificationCount';

type UncategorizedSlotBalanceCardProps = {
  remaining: number;
  unreadCount: number;
};

const UncategorizedSlotBalanceCard: React.FC<UncategorizedSlotBalanceCardProps> = ({
  remaining,
  unreadCount,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = themes[colorScheme];

  // 미분류 슬롯 관련 알림 개수 조회
  const { data: notificationData, isLoading: isNotificationLoading } = useUncategorizedNotificationCount();
  
  // 미분류 슬롯 관련 알림 개수
  const actualUnreadCount = notificationData?.data?.count || 0;

  return (
    <View
      style={[
        styles.container,
        theme.shadows.base,
        {
          backgroundColor: theme.colors.background.primary,
          borderColor: theme.colors.border.light,
          borderWidth: 1,
        },
      ]}
    >
      {/* 잔액 섹션 */}
      <View style={styles.content}>
        <View style={styles.balanceSection}>
          <Text style={styles.label}>잔액</Text>
          <Text style={[styles.amount, { color: remaining < 0 ? "#EF4444" : "#374151" }]}>
            {remaining.toLocaleString()}원
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.notificationSection}>
          <Text style={styles.label}>미읽음 알림</Text>
          <View style={styles.notificationContainer}>
            {actualUnreadCount > 0 ? (
              <Text style={[styles.notificationText, { color: theme.colors.text.primary }]}>
                {actualUnreadCount}
              </Text>
            ) : (
              <Text style={[styles.noNotificationText, { color: theme.colors.text.secondary }]}>
                없음
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceSection: {
    flex: 1,
    alignItems: "center",
  },
  notificationSection: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  notificationContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noNotificationText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default UncategorizedSlotBalanceCard;
