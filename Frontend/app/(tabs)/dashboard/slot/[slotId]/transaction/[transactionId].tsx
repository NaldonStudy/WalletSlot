import React, { useEffect } from 'react';
import { useLocalSearchParams, router , Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, View, StyleSheet, useColorScheme } from 'react-native';
import { SlotTransaction } from '@/src/types/slot';
import { useSlotStore } from '@/src/store/useSlotStore';
import TransactionDetail from '@/src/components/transaction/TransactionDetail';
import { Button } from '@/src/components/Button';
import { Spacing, themes } from '@/src/constants/theme';

export default function TransactionDetailScreen() {
  const { slotId, transactionId, transactionData } = useLocalSearchParams<{ 
    slotId: string; 
    transactionId: string;
    transactionData?: string;
  }>();
  
  const { selectedSlot } = useSlotStore();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  // 버튼 핸들러 함수들
  const handleAmountSplit = () => {
    Alert.alert(
      '금액 나누기',
      '금액 나누기 기능을 구현하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => {
          // TODO: 금액 나누기 로직 구현
        }}
      ]
    );
  };

  const handleDutchPay = () => {
    Alert.alert(
      '더치페이',
      '더치페이 기능을 구현하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => {
          // TODO: 더치페이 로직 구현
        }}
      ]
    );
  };

  useEffect(() => {
    // 거래 데이터가 없는 경우 오류 처리
    if (!transactionData) {
      Alert.alert(
        '오류',
        '거래 정보를 불러올 수 없습니다.',
        [
          {
            text: '확인',
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }

    // 거래 데이터 파싱 시도
    try {
      const parsedTransaction = JSON.parse(transactionData) as SlotTransaction;
      
      // 필수 필드 검증
      if (!parsedTransaction.transactionId || !parsedTransaction.summary) {
        throw new Error('필수 거래 정보가 누락되었습니다.');
      }
    } catch (error) {
      console.error('거래 데이터 파싱 실패:', error);
      Alert.alert(
        '오류',
        '거래 정보를 처리할 수 없습니다.',
        [
          {
            text: '확인',
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [transactionData]);

  // 거래 데이터가 없거나 파싱에 실패한 경우 렌더링하지 않음
  if (!transactionData) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            title: "상세 내역",
            headerBackTitle: "",
          }}
        />
      </SafeAreaView>
    );
  }

  // 거래 데이터 파싱
  let transaction: SlotTransaction;
  try {
    transaction = JSON.parse(transactionData) as SlotTransaction;
  } catch (error) {
    // 이미 useEffect에서 오류 처리를 했으므로 여기서는 렌더링하지 않음
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            title: "상세 내역",
            headerBackTitle: "",
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <Stack.Screen
        options={{
          title: "상세 내역",
          headerBackTitle: "",
        }}
      />
      
      <View style={[styles.contentContainer, { backgroundColor: theme.colors.background.primary }]}>
        <TransactionDetail 
          transaction={transaction} 
          slotName={selectedSlot?.name || selectedSlot?.customName}
        />
      </View>
      
      {/* 액션 버튼들 - 하단 고정 */}
      <View style={[styles.buttonContainer, { backgroundColor: theme.colors.background.primary }]}>
        <Button
          title="금액 나누기"
          variant="outline"
          size="md"
          onPress={handleAmountSplit}
          style={styles.actionButton}
        />
        <Button
          title="더치페이"
          variant="outline"
          size="md"
          onPress={handleDutchPay}
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});

