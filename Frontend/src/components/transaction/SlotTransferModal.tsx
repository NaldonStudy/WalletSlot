import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, ScrollView } from 'react-native';
import { SlotTransaction, SlotData } from '@/src/types/slot';
import { themes, Spacing, Typography } from '@/src/constants/theme';
import BottomSheet from '@/src/components/common/BottomSheet';
import { useSlots } from '@/src/hooks/slots/useSlots';
import { useSlotStore } from '@/src/store/useSlotStore';
import SlotHeader from '@/src/components/slot/SlotHeader';
import { Button } from '@/src/components';
import { transactionApi } from '@/src/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/api/queryKeys';
import { router } from 'expo-router';

interface SlotTransferModalProps {
    visible: boolean;
    onClose: () => void;
    transaction: SlotTransaction;
    accountId?: string; // 계좌 ID
    accountSlotId?: string; // 현재 거래가 속한 슬롯의 accountSlotId
    onSlotSelect?: (slot: SlotData, originalSlot?: SlotData) => void;
}

const SlotTransferModal: React.FC<SlotTransferModalProps> = ({
    visible,
    onClose,
    transaction,
    accountId,
    accountSlotId,
}) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];
    const { selectedSlot } = useSlotStore();
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // 현재 거래가 속한 슬롯의 계좌 ID로 슬롯 리스트 가져오기
    const currentAccountSlotId = accountSlotId || selectedSlot?.accountSlotId;
    const accountIdForSlots = accountId || selectedSlot?.accountId;
    
    // 올바른 계좌 ID로 슬롯 리스트 가져오기
    const { slots, isLoading: slotsLoading } = useSlots(accountIdForSlots);

    // 현재 슬롯 제외한 슬롯만 표시
    const availableSlots = slots.filter((s) => s.accountSlotId !== currentAccountSlotId);



    const isExpense = transaction.type === '출금' || transaction.type === '출금(이체)';

    const handleSlotSelect = (slot: SlotData) => {
        setSelectedSlotId(slot.accountSlotId);
    };

    const handleConfirm = async () => {
        console.log('[SlotTransferModal] handleConfirm 시작:', {
            selectedSlotId,
            selectedSlotAccountId: selectedSlot?.accountId,
            transactionId: transaction.transactionId,
        });

        if (selectedSlotId && selectedSlot?.accountId) {
            try {
                console.log('[SlotTransferModal] moveTransaction API 호출 시작');

                // ✅ API에서 이미 MoveTransactionResponse 반환
                const moveResult = await transactionApi.moveTransaction(
                    selectedSlot.accountId,
                    transaction.transactionId,
                    selectedSlotId
                );

                console.log('[SlotTransferModal] moveTransaction API 응답:', moveResult);

                console.log('[SlotTransferModal] 캐시 무효화 시작');
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: queryKeys.slots.byAccount(selectedSlot.accountId) }),
                    queryClient.invalidateQueries({ queryKey: queryKeys.slots.transactions(selectedSlot.accountId, selectedSlot.accountSlotId) }),
                    queryClient.invalidateQueries({ queryKey: queryKeys.slots.transactions(selectedSlot.accountId, selectedSlotId) }),
                    queryClient.invalidateQueries({ queryKey: queryKeys.slots.dailySpending(selectedSlot.accountId, selectedSlot.accountSlotId) }),
                    queryClient.invalidateQueries({ queryKey: queryKeys.slots.dailySpending(selectedSlot.accountId, selectedSlotId) }),
                    
                    // 계좌 관련 캐시 무효화
                    queryClient.invalidateQueries({ queryKey: queryKeys.accounts.balance(selectedSlot.accountId) }),
                    queryClient.invalidateQueries({ queryKey: queryKeys.accounts.linked() }),
                ]);
                console.log('[SlotTransferModal] 캐시 무효화 완료');

                
                // ✅ 이제 바로 moveResult.reassignedSlot 사용 가능
                if (moveResult.reassignedSlot) {
                    console.log('[SlotTransferModal] 슬롯 재배치 성공:', moveResult.reassignedSlot);

                    onClose();

                    await queryClient.invalidateQueries({
                        queryKey: ['transactionDetail'],
                        exact: false,
                    });

                    const reassignedAccountSlotId = moveResult.reassignedSlot.accountSlotId;
                    const newSlot = slots.find((s) => s.accountSlotId === reassignedAccountSlotId);

                    if (!newSlot) {
                        console.warn('[SlotTransferModal] 새 슬롯을 찾을 수 없음');
                        return;
                    }

                    console.log('[SlotTransferModal] 페이지 이동 시작:', {
                        pathname: `/dashboard/slot/${newSlot.slotId}/transaction/${transaction.transactionId}`,
                    });

                    router.replace({
                        pathname: `/dashboard/slot/${newSlot.slotId}/transaction/${transaction.transactionId}` as any,
                        params: {
                            slotId: newSlot.slotId,
                            transactionId: transaction.transactionId,
                            accountId: selectedSlot.accountId,
                            accountSlotId: reassignedAccountSlotId,
                        },
                    });
                } else {
                    console.log('[SlotTransferModal] reassignedSlot이 없음, 모달 닫기');
                    onClose();
                }
            } catch (error: any) {
                console.error('[SlotTransferModal] 거래내역 이동 실패:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                });
            }
        } else {
            console.log('[SlotTransferModal] 조건 불만족:', {
                selectedSlotId,
                selectedSlotAccountId: selectedSlot?.accountId,
            });
        }
    };



    useEffect(() => {
        if (visible) {
            setSelectedSlotId(null);
        }
    }, [visible]);

    return (
        <BottomSheet visible={visible} onClose={onClose} title="슬롯 설정" height="full">
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={[styles.modalText, { color: theme.colors.text.primary }]}>
                        거래내역을 이동시킬 슬롯을 선택해주세요
                    </Text>

                    <Text style={[styles.transactionTitle, { color: theme.colors.text.primary }]}>
                        이동할 거래내역
                    </Text>
                    <View style={[styles.transactionInfo, { backgroundColor: theme.colors.background.secondary }]}>
                        <View style={styles.transactionDetails}>
                            <Text style={[styles.transactionSummary, { color: theme.colors.text.primary }]}>
                                {transaction.summary}
                            </Text>
                            <Text style={[styles.transactionAmount, { color: theme.colors.text.primary }]}>
                                {isExpense ? '-' : ''}
                                {Math.abs(transaction.amount).toLocaleString()}원
                            </Text>
                        </View>
                    </View>

                    <View style={styles.slotsSection}>
                        <Text style={[styles.slotsTitle, { color: theme.colors.text.primary }]}>슬롯 선택</Text>
                        <ScrollView 
                            style={styles.slotsScrollView}
                            showsVerticalScrollIndicator={true}
                            persistentScrollbar={true}
                            scrollIndicatorInsets={{ right: 1 }}
                        >
                            {slotsLoading ? (
                                <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                                    슬롯을 불러오는 중...
                                </Text>
                            ) : availableSlots.length === 0 ? (
                                <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
                                    이동할 수 있는 다른 슬롯이 없습니다.
                                </Text>
                            ) : (
                                <View style={styles.slotsList}>
                                    {availableSlots.map((slot) => (
                                        <View key={slot.accountSlotId} style={styles.slotItemWrapper}>
                                            <View style={[styles.slotHeaderContainer, theme.shadows.lg]}>
                                                <SlotHeader slot={slot} variant="small" />
                                            </View>
                                            <TouchableOpacity
                                                style={[
                                                    styles.slotItem,
                                                    {
                                                        backgroundColor: theme.colors.background.tertiary,
                                                        borderColor:
                                                            selectedSlotId === slot.accountSlotId
                                                                ? '#007AFF'
                                                                : theme.colors.border.light,
                                                        borderWidth: selectedSlotId === slot.accountSlotId ? 2 : 1,
                                                    },
                                                ]}
                                                onPress={() => handleSlotSelect(slot)}
                                            >
                                                <View style={styles.slotInfo}>
                                                    <Text style={[styles.slotBudget, { color: theme.colors.text.secondary }]}>
                                                        예산: {(slot.currentBudget || 0).toLocaleString()}원
                                                    </Text>
                                                    <Text style={[styles.slotBalance, { color: theme.colors.text.primary }]}>
                                                        잔액: {(slot.remainingBudget || 0).toLocaleString()}원
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>

                <View style={[styles.bottomButtonContainer, { backgroundColor: theme.colors.background.primary }]}>
                    <Button
                        title="확인"
                        onPress={handleConfirm}
                        disabled={!selectedSlotId}
                        variant={selectedSlotId ? 'primary' : 'secondary'}
                        style={styles.confirmButton}
                    />
                </View>
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'column' },
    content: { flex: 1, padding: Spacing.lg },
    bottomButtonContainer: { padding: Spacing.lg, marginBottom: Spacing.lg },
    modalText: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    transactionInfo: { padding: Spacing.base, borderRadius: 8, marginBottom: Spacing.lg },
    transactionTitle: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium, marginBottom: Spacing.sm },
    transactionDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    transactionSummary: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium, flex: 1 },
    transactionAmount: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold },
    slotsSection: { marginBottom: Spacing.lg },
    slotsScrollView: { maxHeight: 450 },
    slotsTitle: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium, marginBottom: Spacing.sm },
    loadingText: { fontSize: Typography.fontSize.sm, textAlign: 'center', padding: Spacing.lg },
    slotsList: { gap: Spacing.lg },
    slotItemWrapper: { position: 'relative', marginTop: Spacing.lg },
    slotItem: { flexDirection: 'column', paddingTop: Spacing.lg, paddingBottom: Spacing.base, paddingHorizontal: Spacing.base, borderRadius: 8, borderWidth: 1 },
    slotHeaderContainer: { position: 'absolute', top: -Spacing.lg, left: -Spacing.base, zIndex: 2, elevation: 2 },
    slotInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    slotBudget: { fontSize: Typography.fontSize.sm },
    slotBalance: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.medium },
    confirmButton: {},
});

export default SlotTransferModal;
