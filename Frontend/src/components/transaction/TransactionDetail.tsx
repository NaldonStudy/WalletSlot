import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { SlotTransaction, SlotData } from '@/src/types/slot';
import { themes } from '@/src/constants/theme';
import ChevronRight from '@/src/assets/icons/common/ChevronRight.svg';
import SlotTransferModal from '@/src/components/transaction/SlotTransferModal';
import { useSlotStore } from '@/src/store/useSlotStore';

interface TransactionDetailProps {
  transaction: SlotTransaction;
  slotName?: string; // 부모에서 내려주는 원래 슬롯 이름
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({
  transaction,
  slotName,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  const [isBottomModalVisible, setIsBottomModalVisible] = useState(false);
  const { selectedSlot, setSelectedSlot } = useSlotStore();

  // 👉 화면 표시용 슬롯 이름 (전역 상태와 분리)
  const [displaySlot, setDisplaySlot] = useState(
    selectedSlot?.name || selectedSlot?.customName || slotName || ''
  );

  // 부모에서 slotName이 바뀌면 동기화 (뒤로가기 시 원래 슬롯 복원)
  useEffect(() => {
    if (slotName) {
      setDisplaySlot(slotName);
    }
  }, [slotName]);

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    } catch (error) {
      return dateTimeString;
    }
  };

  const isIncome = transaction.type === '입금' || transaction.type === '입금(이체)';
  const isExpense = transaction.type === '출금' || transaction.type === '출금(이체)';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* 주요 거래 정보 */}
      <View
        style={[
          styles.mainSection,
          theme.shadows.base,
          {
            backgroundColor: theme.colors.background.tertiary,
            borderColor: theme.colors.border.light,
            borderWidth: 1,
          },
        ]}
      >
        <Text style={[styles.merchantName, { color: theme.colors.text.primary }]}>
          {transaction.summary}
        </Text>
        <Text style={[styles.amount, { color: theme.colors.text.primary }]}>
          {isExpense ? '-' : ''}
          {Math.abs(transaction.amount).toLocaleString()}원
        </Text>
      </View>

      {/* 상세 정보 */}
      <View style={[styles.detailSection, { backgroundColor: theme.colors.background.primary }]}>
        {displaySlot && (
          <View
            style={[styles.detailRow, { borderBottomColor: theme.colors.border.light }]}
          >
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
              슬롯 설정
            </Text>
            <View style={styles.valueWithIcon}>
              <Text style={[styles.detailValue, { color: '#60A5FA' }]}>{displaySlot}</Text>
              <TouchableOpacity onPress={() => setIsBottomModalVisible(true)}>
                <ChevronRight
                  width={16}
                  height={16}
                  fill={theme.colors.text.secondary}
                  style={styles.chevronIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={[styles.detailRow, { borderBottomColor: theme.colors.border.light }]}>
          <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
            결제일시
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
            {formatDateTime(transaction.transactionAt)}
          </Text>
        </View>

        <View style={[styles.detailRow, { borderBottomColor: theme.colors.border.light }]}>
          <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
            거래 유형
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
            {transaction.type}
          </Text>
        </View>

        {transaction.type === '출금(이체)' && (
          <View style={[styles.detailRow, { borderBottomColor: theme.colors.border.light }]}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
              상대방 계좌
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
              {transaction.opponentAccountNo}
            </Text>
          </View>
        )}

        <View style={[styles.detailRow, { borderBottomColor: theme.colors.border.light }]}>
          <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
            거래 후 잔액
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
            {transaction.balance.toLocaleString()}원
          </Text>
        </View>
      </View>

      {/* 슬롯 이동 모달 */}
      <SlotTransferModal
        visible={isBottomModalVisible}
        onClose={() => setIsBottomModalVisible(false)}
        transaction={transaction}
                onSlotSelect={() => {
                    // 슬롯 이동 성공 시 이 콜백은 호출되지 않음
                    // 대신 SlotTransferModal에서 직접 네비게이션 처리
                }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // 배경색
  },
  mainSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 3, // Android 그림자 효과
  },
  merchantName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailSection: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  valueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronIcon: {
    marginLeft: 8,
  },
});

export default TransactionDetail;
