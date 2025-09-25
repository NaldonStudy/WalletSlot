import React, { useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Alert } from 'react-native';
import { SlotTransaction } from '@/src/types/slot';
import { useSlotStore } from '@/src/store/useSlotStore';
import TransactionDetail from '@/src/components/transaction/TransactionDetail';

export default function TransactionDetailScreen() {
  const { slotId, transactionId, transactionData } = useLocalSearchParams<{ 
    slotId: string; 
    transactionId: string;
    transactionData?: string;
  }>();
  
  const { selectedSlot } = useSlotStore();

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
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "상세 내역",
          headerBackTitle: "",
        }}
      />
      
      <TransactionDetail 
        transaction={transaction} 
        slotName={selectedSlot?.name || selectedSlot?.customName}
      />
    </SafeAreaView>
  );
}

