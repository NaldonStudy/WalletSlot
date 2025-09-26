import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { useLocalSearchParams , Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSlotStore } from '@/src/store/useSlotStore';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import { SLOT_CATEGORIES } from '@/src/constants/slots';
import SlotHeader from '@/src/components/slot/SlotHeader';
import SlotSpendingChart from '@/src/components/slot/SlotSpendingChart';
import SlotBalanceCard from '@/src/components/slot/SlotBalanceCard';
import UncategorizedSlotBalanceCard from '@/src/components/slot/UncategorizedSlotBalanceCard';
import { useSlotDailySpending } from '@/src/hooks/slots/useSlotDailySpending';
import { useSlotTransactions } from '@/src/hooks/slots/useSlotTransactions';
import { useSlots } from '@/src/hooks/slots/useSlots';
import TransactionList from '@/src/components/transaction/TransactionList';
import { SlotTransaction } from '@/src/types/slot';
import { UNCATEGORIZED_SLOT_ID } from '@/src/constants/slots';


export default function SlotDetailScreen() {
    const { slotId } = useLocalSearchParams<{ slotId: string }>();
    const { selectedSlot } = useSlotStore();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];

    // API를 통해 최신 슬롯 데이터 가져오기
    const { slots, isLoading: slotsLoading } = useSlots(selectedSlot?.accountId);
    
    // 현재 슬롯 결정 - 단순화된 로직
    const currentSlot = selectedSlot;

    const { data: dailySpending, isLoading } = useSlotDailySpending(
        selectedSlot?.accountId, // 계좌 ID
        slotId
    );

    // 실제 API를 사용한 거래내역 조회
    const { 
        transactions: apiTransactions, 
        isLoading: isTransactionsLoading,
        totalPages,
        currentPage 
    } = useSlotTransactions({
        accountId: selectedSlot?.accountId || '',
        accountSlotId: selectedSlot?.accountSlotId || '',
        params: {
            page: 1,
            pageSize: 20,
        },
        enabled: !!selectedSlot?.accountId && !!selectedSlot?.accountSlotId
    });

    // API에서 받은 거래내역 데이터 사용
    const transactions = apiTransactions;

    // 로딩 중이거나 슬롯 데이터가 없을 때 처리
    if (slotsLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.error}>슬롯 정보를 불러오는 중...</Text>
            </SafeAreaView>
        );
    }

    if (!currentSlot) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.error}>슬롯 정보를 불러올 수 없습니다.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            {/* 헤더 제목 */}
            <Stack.Screen
                options={{
                    title: "슬롯 상세 거래내역",
                    headerBackTitle: "", // iOS에서 뒤로가기 텍스트 안보이게
                }}
            />
            
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* SlotHeader 컴포넌트 사용 */}
                <SlotHeader slot={currentSlot} variant="large" />

                {/* 잔액 현황 카드 */}
                {currentSlot.slotId === UNCATEGORIZED_SLOT_ID ? (
                    <UncategorizedSlotBalanceCard
                        remaining={currentSlot.remainingBudget}
                        unreadCount={3} // TODO: 실제 미읽음 알림 개수로 교체
                    />
                ) : (
                    <SlotBalanceCard
                        remaining={currentSlot.remainingBudget}
                        budget={currentSlot.currentBudget}
                        color={SLOT_CATEGORIES[currentSlot.slotId as keyof typeof SLOT_CATEGORIES]?.color || '#F1A791'}
                    />
                )}

                {/* 누적 지출 그래프 */}
                <View style={styles.chartContainer}>
                    {isLoading ? (
                        <View style={styles.loadingCard}>
                            <Text style={styles.loadingText}>불러오는 중...</Text>
                        </View>
                    ) : dailySpending && dailySpending.transactions ? (
                        <SlotSpendingChart
                            data={dailySpending}
                            slotName={currentSlot.name}
                            color={SLOT_CATEGORIES[currentSlot.slotId as keyof typeof SLOT_CATEGORIES]?.color || '#F1A791'}
                            budget={currentSlot.currentBudget}
                        />
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>데이터 없음</Text>
                        </View>
                    )}
                </View>
                
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>상세 거래 내역</Text>
                    {isTransactionsLoading ? (
                        <View style={styles.loadingCard}>
                            <Text style={styles.loadingText}>거래내역을 불러오는 중...</Text>
                        </View>
                    ) : transactions.length > 0 ? (
                        <TransactionList 
                            transactions={transactions} 
                            slotId={slotId}
                            accountId={currentSlot?.accountId}
                            accountSlotId={currentSlot?.accountSlotId}
                        />
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>거래내역이 없습니다.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB", // 기본 배경 (테마 색상으로 덮어씌워짐)
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20, // 하단 여백
    },
    error: {
        padding: Spacing.lg,
        textAlign: "center",
        color: "#888",
    },
    chartContainer: {
        paddingHorizontal: 16,
        marginTop: 16,
    },
    loadingCard: {
        flex: 1,
        borderRadius: 12,
        backgroundColor: "#fff",
        padding: 12,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 14,
        color: "#666",
    },
    emptyCard: {
        flex: 1,
        borderRadius: 12,
        backgroundColor: "#fff",
        padding: 12,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#666",
    },
    section: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        marginBottom: Spacing.base,
    },
});

