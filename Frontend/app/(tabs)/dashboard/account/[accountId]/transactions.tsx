import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import { AccountSummary } from '@/src/components/account/AccountSummary';
import TransactionItem from '@/src/components/transaction/transactionItem';
import { useAccountTransactionsInfinite } from '@/src/hooks/transactions/useAccountTransactionsInfinite';
import { useAccounts } from '@/src/hooks';
import type { AccountTransaction, UserAccount } from '@/src/types';
import { format } from '@/src/utils';


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

// 거래내역을 날짜별로 그룹화하는 함수 (슬롯 상세 화면과 동일한 로직)
const groupTransactionsByDate = (transactions: AccountTransaction[]) => {
  const grouped: { [key: string]: AccountTransaction[] } = {};
  
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

// AccountTransaction을 SlotTransaction으로 변환하는 함수
const convertToSlotTransaction = (accountTransaction: AccountTransaction) => {
  return {
    transactionId: accountTransaction.transactionId,
    type: accountTransaction.type,
    opponentAccountNo: accountTransaction.opponentAccountNo,
    summary: accountTransaction.summary,
    amount: accountTransaction.amount,
    balance: accountTransaction.balance,
    transactionAt: accountTransaction.transactionAt,
  };
};

export default function AccountTransactionsScreen() {
  const { accountId } = useLocalSearchParams<{ accountId: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  
  const [refreshing, setRefreshing] = useState(false);
  
  // 계좌 정보 조회
  const { linked } = useAccounts();
  const currentAccount = linked.accounts?.find((account: UserAccount) => account.accountId === accountId);
  
  // 계좌 전체 거래내역 무한 스크롤 조회
  const { 
    data: transactionsData, 
    isLoading, 
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error, 
    refetch 
  } = useAccountTransactionsInfinite(accountId, 20);
  
  const transactions = transactionsData?.transactions || [];
  const groupedTransactions = useMemo(() => groupTransactionsByDate(transactions), [transactions]);
  
  // 새로고침 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);
  
  // 무한 스크롤 핸들러
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  // FlatList 렌더 아이템
  const renderItem = useCallback(({ item }: { item: { date: string; transactions: AccountTransaction[] } }) => {
    return (
      <View style={styles.dateGroup}>
        {item.transactions.map((transaction, index) => (
          <View key={transaction.transactionId} style={styles.transactionRow}>
            <View style={styles.transactionColumn}>
              <TransactionItem 
                transaction={convertToSlotTransaction(transaction)} 
                showDate={index === 0}
                dateText={formatDate(transaction.transactionAt)}
                isLastInDate={index === item.transactions.length - 1}
                accountId={accountId}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }, []);
  
  // 로딩 푸터
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
        <Text style={[styles.loadingFooterText, { color: theme.colors.text.secondary }]}>
          더 많은 거래내역을 불러오는 중...
        </Text>
      </View>
    );
  }, [isFetchingNextPage, theme]);
  
  if (!currentAccount) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            계좌 정보를 찾을 수 없습니다.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Stack.Screen 
        options={{ 
          title: '전체 거래내역',
          headerStyle: { backgroundColor: theme.colors.background.primary },
          headerTintColor: theme.colors.text.primary,
        }} 
      />
      
      <FlatList
        data={groupedTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View>
            {/* 계좌 요약 (거래내역 버튼 없이) */}
            <View style={styles.summaryContainer}>
              <AccountSummary account={currentAccount} />
            </View>
            
            {/* 거래내역 섹션 헤더 */}
            <View style={styles.transactionsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                거래내역
              </Text>
              
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                    거래내역을 불러오는 중...
                  </Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
                    거래내역을 불러올 수 없습니다.
                  </Text>
                </View>
              ) : transactions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                    거래내역이 없습니다.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        }
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 100,
  },
  summaryContainer: {
    padding: Spacing.lg,
  },
  transactionsSection: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.base,
  },
  loadingContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
  },
  errorContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
   transactionsList: {
     gap: Spacing.base,
   },
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
  loadingFooter: {
    padding: Spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingFooterText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
  },
});
