import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { BottomSheet } from '@/src/components';
import { Button } from '@/src/components/Button';
import { Spacing, themes } from '@/src/constants/theme';
import { SlotTransaction } from '@/src/types/slot';
import { Ionicons } from '@expo/vector-icons';
import { transactionApi } from '@/src/api/transaction';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/api/queryKeys';

interface DutchPayBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  transaction: SlotTransaction;
  theme: any;
  accountId?: string;
  accountSlotId?: string;
}

export const DutchPayBottomSheet: React.FC<DutchPayBottomSheetProps> = ({
  visible,
  onClose,
  transaction,
  theme,
  accountId,
  accountSlotId,
}) => {
  const [participantCount, setParticipantCount] = useState('');
  const [perPersonAmount, setPerPersonAmount] = useState<number | null>(null);
  const queryClient = useQueryClient();


  // 1인당 금액 계산
  useEffect(() => {
    if (transaction?.amount && participantCount && participantCount.trim() !== '') {
      const totalAmount = Number(transaction.amount);
      const count = Number(participantCount);
      if (count > 0) {
        setPerPersonAmount(Math.floor(totalAmount / count));
      } else {
        setPerPersonAmount(null);
      }
    } else {
      setPerPersonAmount(null);
    }
  }, [transaction?.amount, participantCount]);

  const handleDutchPayRequest = async () => {
    
    if (!accountId || !transaction.transactionId || !participantCount.trim()) {
      Alert.alert('오류', '필수 정보가 누락되었습니다.');
      return;
    }


    try {
      const response = await transactionApi.requestDutchPay(
        accountId,
        transaction.transactionId,
        Number(participantCount)
      );

      
      // 더치페이 성공 시 관련 데이터 새로고침
      if (accountId) {
        // 슬롯 목록 새로고침
        await queryClient.invalidateQueries({
          queryKey: queryKeys.slots.byAccount(accountId)
        });
        
        // 해당 슬롯의 거래내역 새로고침
        if (accountSlotId) {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.slots.transactions(accountId, accountSlotId)
          });
        }
        
        // 계좌 잔액 정보 새로고침
        await queryClient.invalidateQueries({
          queryKey: queryKeys.accounts.balance(accountId)
        });

      }
      
      onClose();
    } catch (error) {
      Alert.alert('오류', '더치페이 요청에 실패했습니다.');
    }
  };

  // 나머지 금액 계산 (본인이 부담할 금액)
  const remainingAmount = transaction?.amount && perPersonAmount ? Number(transaction.amount) - perPersonAmount : 0;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="더치페이"
      showCloseButton={true}
    >
      <View style={styles.bottomSheetContent}>
        {/* 상단 설명 문구 */}
        <Text style={[styles.descriptionText, { color: theme.colors.text.secondary }]}>
          본인 실제 사용액을 제외하고{'\n'}미분류 Slot으로 옮겨드려요!
        </Text>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            {/* 카드 컨테이너 */}
            <View style={[styles.cardContainer, { backgroundColor: theme.colors.background.primary }]}>
              {/* 나눌 금액 섹션 */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>
                  나눌 금액
                </Text>
                <Text style={[styles.amountValue, { color: theme.colors.text.primary }]}>
                  -{transaction?.amount ? `${Number(transaction.amount).toLocaleString()}원` : '0원'}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              {/* 함께한 사람 섹션 */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>
                  함께한 사람(본인 포함)
                </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.inputField, { 
                      borderColor: '#3B82F6',
                      color: theme.colors.text.primary 
                    }]}
                    value={participantCount}
                    onChangeText={setParticipantCount}
                    keyboardType="numeric"
                    placeholder=""
                  />
                  <Text style={[styles.unitText, { color: theme.colors.text.primary }]}>
                    명
                  </Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              {/* 인당 금액 섹션 */}
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.text.primary }]}>
                  인당
                </Text>
                <View style={styles.perPersonContainer}>
                  <Text style={[styles.perPersonAmount, { color: theme.colors.text.primary }]}>
                    {perPersonAmount ? `-${perPersonAmount.toLocaleString()}` : ''}
                  </Text>
                  <Text style={[styles.unitText, { color: theme.colors.text.primary }]}>
                    {perPersonAmount ? '원' : ''}
                  </Text>
                </View>
              </View>
            </View>

            {/* 하단 설명 */}
            {perPersonAmount && (
              <Text style={[styles.bottomDescription, { color: theme.colors.text.primary }]}>
                나머지 {remainingAmount.toLocaleString()}원 결제 내역을{'\n'}미분류 Slot에서 차감합니다
              </Text>
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* 하단 버튼 */}
        <View style={styles.buttonContainer}>
          <Button
            title="확인"
            variant={participantCount.trim() ? "primary" : "secondary"}
            size="md"
            onPress={handleDutchPayRequest}
            disabled={!participantCount.trim()}
            style={styles.bottomSheetButton}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: Spacing.lg,
  },
  cardContainer: {
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    minWidth: 40,
    marginRight: 4,
    backgroundColor: 'transparent',
  },
  perPersonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  perPersonAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: Spacing.sm,
  },
  bottomDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    alignItems: 'flex-end',
  },
  bottomSheetButton: {
    flex: 1,
  },
});

