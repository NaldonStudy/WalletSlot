import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, View, StyleSheet, useColorScheme, Text } from 'react-native';
import { SlotTransaction } from '@/src/types/slot';
import { useSlotStore } from '@/src/store/useSlotStore';
import TransactionDetail from '@/src/components/transaction/TransactionDetail';
import { Button } from '@/src/components/Button';
import { DutchPayBottomSheet } from '@/src/components/transaction/DutchPayBottomSheet';
import { Spacing, themes } from '@/src/constants/theme';
import { transactionApi } from '@/src/api/transaction';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';

export default function TransactionDetailScreen() {
  const { slotId, transactionId, transactionData, slotData, slotName, accountId, accountSlotId } = useLocalSearchParams<{ 
    slotId: string; 
    transactionId: string;
    transactionData?: string;
    slotData?: string;
    slotName?: string;
    accountId?: string;
    accountSlotId?: string;
  }>();
  
  // selectedSlot 의존성 제거 - URL 파라미터만 사용
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  const navigation = useNavigation();

  // 탭바 숨기기
  useFocusEffect(
    React.useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' }
      });

      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: { display: 'flex' }
        });
      };
    }, [navigation])
  );

  // BottomSheet 상태 관리
  const [isDutchPayBottomSheetVisible, setIsDutchPayBottomSheetVisible] = useState(false);

  // 거래 상세 API 호출
  const { 
    data: transactionDetailData, 
    isLoading: isTransactionLoading,
    error: transactionError 
  } = useQuery({
    queryKey: ['transactionDetail', accountId, accountSlotId, transactionId],
    queryFn: () => {
      console.log('[TransactionDetailScreen] getTransactionDetail API 호출:', {
        accountId,
        accountSlotId,
        transactionId
      });
      return transactionApi.getTransactionDetail(
        accountId || '',
        accountSlotId || '',
        transactionId || ''
      );
    },
    enabled: !!accountId && !!accountSlotId && !!transactionId,
  });

  // API 응답 디버깅
  useEffect(() => {
    if (transactionDetailData) {
      console.log('[TransactionDetailScreen] getTransactionDetail API 응답:', transactionDetailData);
    }
  }, [transactionDetailData]);

  // 파라미터 상태 디버깅
  console.log('[TransactionDetailScreen] 파라미터 상태:', {
    accountId,
    accountSlotId,
    transactionId,
    enabled: !!accountId && !!accountSlotId && !!transactionId
  });

  // 버튼 핸들러 함수들
  const handleAmountSplit = () => {
    // 거래 데이터가 있는 경우에만 네비게이션
    if (transactionDetailData?.data?.transaction) {
      const transactionData = transactionDetailData.data.transaction;
      const transactionDataString = JSON.stringify(transactionData);
      
      router.push({
        pathname: '/(tabs)/dashboard/slot/[slotId]/transaction/[transactionId]/splits',
        params: {
          slotId: slotId || '',
          transactionId: transactionId || '',
          transactionData: transactionDataString,
          slotData: slotData || '',
          slotName: slotName || '',
          accountId: accountId || '',
          accountSlotId: accountSlotId || '',
        }
      });
    }
  };

  const handleDutchPay = () => {
    setIsDutchPayBottomSheetVisible(true);
  };

  // API 에러 처리
  useEffect(() => {
    if (transactionError) {
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
    }
  }, [transactionError]);

  // 로딩 중인 경우
  if (isTransactionLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text.primary }}>거래 정보를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // API 데이터가 없는 경우
  if (!transactionDetailData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text.primary }}>거래 정보를 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // API에서 받은 데이터를 SlotTransaction 타입으로 변환
  const transaction: SlotTransaction = {
    ...transactionDetailData.data.transaction,
    opponentAccountNo: transactionDetailData.data.transaction.opponentAccountNo || '',
  };
  const slot = transactionDetailData.data.slot;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <View style={[styles.contentContainer, { backgroundColor: theme.colors.background.primary }]}>
        <TransactionDetail 
          transaction={transaction} 
          slot={slot}
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

      {/* 더치페이 BottomSheet */}
        <DutchPayBottomSheet
          visible={isDutchPayBottomSheetVisible}
          onClose={() => setIsDutchPayBottomSheetVisible(false)}
          transaction={transaction}
          theme={theme}
          accountId={accountId}
          accountSlotId={accountSlotId}
        />
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
