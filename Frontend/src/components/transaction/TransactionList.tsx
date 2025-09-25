import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import type { SlotTransaction } from "@/src/types/slot";
import { themes } from "@/src/constants/theme";
import TransactionItem from "./transactionItem";

interface Props {
  transactions: SlotTransaction[];
  slotId?: string; // 슬롯 ID 추가
}

// 날짜 포맷팅 함수
const formatDate = (dateTimeString: string) => {
  try {
    const date = new Date(dateTimeString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}.${day}`;
  } catch (error) {
    return dateTimeString;
  }
};

// 거래내역을 날짜별로 그룹화하는 함수
const groupTransactionsByDate = (transactions: SlotTransaction[]) => {
  const grouped: { [key: string]: SlotTransaction[] } = {};
  
  transactions.forEach((transaction) => {
    const date = new Date(transaction.transactionAt).toDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(transaction);
  });
  
  // 날짜별로 정렬 (최신순)
  return Object.keys(grouped)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => ({
      date,
      transactions: grouped[date].sort((a, b) => 
        new Date(b.transactionAt).getTime() - new Date(a.transactionAt).getTime()
      )
    }));
};

const TransactionList = ({ transactions, slotId }: Props) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  
  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <View>
      {groupedTransactions.map(({ date, transactions: dayTransactions }) => (
        <View key={date} style={styles.dateGroup}>
          {dayTransactions.map((transaction, index) => (
            <View key={transaction.transactionId} style={styles.transactionRow}>
              <View style={styles.transactionColumn}>
                <TransactionItem 
                  transaction={transaction} 
                  showDate={index === 0}
                  dateText={formatDate(transaction.transactionAt)}
                  slotId={slotId}
                />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  dateGroup: {
    marginBottom: 8,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  transactionColumn: {
    flex: 1,
  },
});

export default TransactionList;
