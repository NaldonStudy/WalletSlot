import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import type { SlotTransaction } from "@/src/types/slot";
import { themes } from "@/src/constants/theme";

interface Props {
  transaction: SlotTransaction;
}

const TransactionItem = ({ transaction }: Props) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];  
    const isIncome = transaction.amount > 0;
  
    return (
      <View style={styles.container}>
        <View>
          <Text style={[styles.summary,{color: theme.colors.text.primary}]}>{transaction.summary}</Text>
          <Text style={[styles.date,{color: theme.colors.text.secondary}]}>{transaction.date}</Text>
        </View>
        <View>
          <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
            {transaction.amount.toLocaleString()}원
          </Text>
          <Text style={[styles.remaining,{color: theme.colors.text.secondary}]}>
            잔액 {transaction.remaining.toLocaleString()}원
          </Text>
        </View>
      </View>
    );
  };
  

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  summary: { fontSize: 16, fontWeight: "600" },
  date: { fontSize: 12, },
  amount: { fontSize: 16, fontWeight: "700", textAlign: "right" },
  income: { color: "#2563EB" },
  expense: { color: "#EF4444" },
  remaining: { fontSize: 12, textAlign: "right" },
});

export default TransactionItem;
