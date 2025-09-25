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
    onSlotSelect?: (slot: SlotData, originalSlot?: SlotData) => void;
}

const SlotTransferModal: React.FC<SlotTransferModalProps> = ({
    visible,
    onClose,
    transaction,
    onSlotSelect
}) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];
    const { selectedSlot } = useSlotStore();
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // 현재 슬롯의 계좌 ID를 사용하여 슬롯 리스트 가져오기
    const { slots, isLoading: slotsLoading } = useSlots(selectedSlot?.accountId);

    // 현재 슬롯을 제외한 슬롯 리스트 필터링
    const availableSlots = slots.filter(slot => slot.accountSlotId !== selectedSlot?.accountSlotId);

    // 거래 유형에 따른 출금 여부 확인
    const isExpense = transaction.type === '출금' || transaction.type === '출금(이체)';

    const handleSlotSelect = (slot: SlotData) => {
        setSelectedSlotId(slot.accountSlotId);
    };

    const handleConfirm = async () => {
        if (selectedSlotId && selectedSlot?.accountId) {
            try {
                // 거래내역을 선택된 슬롯으로 이동
                const moveResult = await transactionApi.moveTransaction(
                    selectedSlot.accountId,
                    transaction.transactionId,
                    selectedSlotId
                );

                // 효율적인 캐시 무효화 전략
                
                // 1. 슬롯 목록 무효화 (잔액 변경으로 인한 데이터 갱신)
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.slots.byAccount(selectedSlot.accountId)
                });
                
                // 2. 거래내역 무효화 (원래 슬롯과 이동된 슬롯)
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.slots.transactions(selectedSlot.accountId, selectedSlot.accountSlotId)
                });
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.slots.transactions(selectedSlot.accountId, selectedSlotId)
                });
                
                // 3. 일일 지출 데이터 무효화 (원래 슬롯과 이동된 슬롯)
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.slots.dailySpending(selectedSlot.accountId, selectedSlot.accountSlotId)
                });
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.slots.dailySpending(selectedSlot.accountId, selectedSlotId)
                });
                
                // 4. 계좌 관련 데이터 무효화
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.accounts.balance(selectedSlot.accountId)
                });
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.accounts.linked()
                });
                

                // 성공 시 콜백 호출 및 모달 닫기
                if (moveResult.data?.reassignedSlot) {
                    // 서버에서 받은 reassignedSlot 정보를 사용
                    const reassignedSlot = moveResult.data.reassignedSlot;
                    const originalSlot = moveResult.data.originalSlot;
                    
                    // 모달 닫기
                    onClose();
                    
                    // 거래내역 상세 페이지에서 나와서 슬롯 상세 페이지로 이동
                    router.push({
                        pathname: '/(tabs)/dashboard/slot/[slotId]',
                        params: { 
                            slotId: reassignedSlot.accountSlotId
                        }
                    });
                } else {
                    console.warn('[SlotTransferModal] reassignedSlot이 없습니다:', moveResult);
                    onClose();
                }
            } catch (error: any) {
                console.error('[SlotTransferModal] 거래내역 이동 실패:', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data,
                    requestData: {
                        accountId: selectedSlot.accountId,
                        transactionId: transaction.transactionId,
                        targetAccountSlotId: selectedSlotId
                    }
                });
                // 에러 처리 (필요시 사용자에게 알림)
            }
        }
    };

    // 바텀시트가 열릴 때마다 선택 상태 초기화
    useEffect(() => {
        if (visible) {
            setSelectedSlotId(null);
        }
    }, [visible]);

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            title="슬롯 설정"
            height="full"
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={[styles.modalText, { color: theme.colors.text.primary }]}>
                        거래내역을 이동시킬 슬롯을 선택해주세요
                    </Text>

                    {/* 현재 거래 내역 정보 */}
                    <Text style={[styles.transactionTitle, { color: theme.colors.text.primary }]}>
                        이동할 거래내역
                    </Text>

                    <View style={[styles.transactionInfo, { backgroundColor: theme.colors.background.secondary }]}>
                        <View style={styles.transactionDetails}>
                            <Text style={[styles.transactionSummary, { color: theme.colors.text.primary }]}>
                                {transaction.summary}
                            </Text>
                            <Text style={[styles.transactionAmount, { color: theme.colors.text.primary }]}>
                                {isExpense ? '-' : ''}{Math.abs(transaction.amount).toLocaleString()}원
                            </Text>
                        </View>
                    </View>

                    {/* 슬롯 리스트 */}
                    <View style={styles.slotsSection}>
                        <Text style={[styles.slotsTitle, { color: theme.colors.text.primary }]}>
                            슬롯 선택
                        </Text>
                        <ScrollView style={styles.slotsScrollView}>
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
                                                style={[styles.slotItem, {
                                                    backgroundColor: theme.colors.background.tertiary,
                                                    borderColor: selectedSlotId === slot.accountSlotId ? '#007AFF' : theme.colors.border.light,
                                                    borderWidth: selectedSlotId === slot.accountSlotId ? 2 : 1,
                                                }]}
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

                {/* 하단 고정 확인 버튼 */}
                <View style={[styles.bottomButtonContainer, { backgroundColor: theme.colors.background.primary }]}>
                    <Button
                        title="확인"
                        onPress={handleConfirm}
                        disabled={!selectedSlotId}
                        variant={selectedSlotId ? "primary" : "secondary"}
                        style={styles.confirmButton}
                    />
                </View>
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
    },
    bottomButtonContainer: {
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    modalText: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    transactionInfo: {
        padding: Spacing.base,
        borderRadius: 8,
        marginBottom: Spacing.lg,
    },
    transactionTitle: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: Spacing.sm,
    },
    transactionDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionSummary: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.medium,
        flex: 1,
    },
    transactionAmount: {
        fontSize: Typography.fontSize.base,
        fontWeight: Typography.fontWeight.bold,
    },
    slotsSection: {
        marginBottom: Spacing.lg,
    },
    slotsScrollView: {
        maxHeight: 200,
    },
    slotsTitle: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: Spacing.sm,
    },
    loadingText: {
        fontSize: Typography.fontSize.sm,
        textAlign: 'center',
        padding: Spacing.lg,
    },
    slotsList: {
        gap: Spacing.lg,
    },
    slotItemWrapper: {
        position: 'relative',
        marginTop: Spacing.lg,
    },
    slotItem: {
        flexDirection: 'column',
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.base,
        paddingHorizontal: Spacing.base,
        borderRadius: 8,
        borderWidth: 1,
    },
    slotHeaderContainer: {
        position: 'absolute',
        top: -Spacing.lg,
        left: -Spacing.base,
        zIndex: 2,
        elevation: 2, // Android에서 z-index 효과
    },
    slotInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    slotBudget: {
        fontSize: Typography.fontSize.sm,
    },
    slotBalance: {
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
    },
    confirmButton: {
        // 하단 고정 버튼이므로 marginTop 제거
    },
});

export default SlotTransferModal;