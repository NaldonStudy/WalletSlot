import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import type { SlotTransaction } from "@/src/types/slot";
import { themes } from "@/src/constants/theme";

// 시간 포맷팅 함수
const formatTime = (dateTimeString: string) => {
  try {
    const date = new Date(dateTimeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    return dateTimeString;
  }
};

interface Props {
  transaction: SlotTransaction;
  showDate?: boolean;
  dateText?: string;
}

const TransactionItem = ({ transaction, showDate = false, dateText }: Props) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];  
    
    // type 필드를 기반으로 색상 결정
    const isIncome = transaction.type === '입금' || transaction.type === '입금(이체)';
    const isExpense = transaction.type === '출금' || transaction.type === '출금(이체)';
  
    return (
      <View style={[styles.container, showDate && styles.containerWithDate]}>
        <View style={styles.leftSection}>
          {showDate && dateText && (
            <Text style={[styles.dateText, { color: theme.colors.text.secondary }]}>
              {dateText}
            </Text>
          )}
          <View style={styles.transactionInfo}>
            <Text style={[styles.summary,{color: theme.colors.text.primary}]}>{transaction.summary}</Text>
            <Text style={[styles.time,{color: theme.colors.text.secondary}]}>{formatTime(transaction.transactionAt)}</Text>
          </View>
        </View>
        <View>
          <Text style={[
            styles.amount, 
            isIncome ? styles.income : isExpense ? styles.expense : styles.neutral
          ]}>
            {(transaction.amount ?? 0).toLocaleString()}원
          </Text>
          <Text style={[styles.remaining,{color: theme.colors.text.secondary}]}>
            잔액 {(transaction.balance ?? 0).toLocaleString()}원
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
  containerWithDate: {
    borderBottomWidth: 0, // 날짜가 있는 경우 밑줄 제거
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
    minWidth: 40,
  },
  transactionInfo: {
    flex: 1,
  },
  summary: { fontSize: 16, fontWeight: "600" },
  time: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "700", textAlign: "right" },
  income: { color: "#2563EB" }, // 파란색 - 입금
  expense: { color: "#EF4444" }, // 빨간색 - 출금
  neutral: { color: "#6B7280" }, // 회색 - 기타
  remaining: { fontSize: 12, textAlign: "right" },
});

export default TransactionItem;
