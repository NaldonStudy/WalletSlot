import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import { themes } from "@/src/constants/theme";

type SlotBalanceCardProps = {
  remaining: number;
  budget: number;
  color?: string;
  startDate?: string;
  endDate?: string;
};

const SlotBalanceCard: React.FC<SlotBalanceCardProps> = ({
  remaining,
  budget,
  color = "#F59E0B",
  startDate,
  endDate,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = themes[colorScheme];

  const balancePercentage = budget > 0 ? (remaining / budget) * 100 : 0;

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
      {/* 기간 정보 */}
      {(startDate || endDate) && (
        <View style={styles.periodSection}>
          <Text style={styles.periodText}>
            {startDate && endDate 
              ? `${startDate} ~ ${endDate}`
              : startDate || endDate
            }
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.balanceSection}>
          <Text style={styles.label}>잔액</Text>
          <Text style={[styles.amount, { color: remaining < 0 ? "#EF4444" : color }]}>
            {remaining.toLocaleString()}원
          </Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.budgetSection}>
          <Text style={styles.label}>예산</Text>
          <Text style={[styles.amount, { color: "#6B7280" }]}>
            {budget.toLocaleString()}원
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(balancePercentage, 100)}%`,
                backgroundColor: balancePercentage < 20 ? "#EF4444" : color,
              },
            ]}
          />
        </View>
        <Text style={styles.percentage}>
          {balancePercentage.toFixed(1)}%
        </Text>
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
  periodSection: {
    marginBottom: 12,
    alignItems: "center",
  },
  periodText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  balanceSection: {
    flex: 1,
    alignItems: "center",
  },
  budgetSection: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  percentage: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    minWidth: 40,
    textAlign: "right",
  },
});

export default SlotBalanceCard;
