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
import { useSlotDailySpending } from '@/src/hooks/slots/useSlotDailySpending';
import { useSlotTransactions } from '@/src/hooks/slots/useSlotTransactions';
import TransactionList from '@/src/components/transaction/TransactionList';
import { SlotTransaction } from '@/src/types/slot';


export default function SlotDetailScreen() {
    const { slotId } = useLocalSearchParams<{ slotId: string }>();
    const { selectedSlot } = useSlotStore();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];

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

    if (!selectedSlot || selectedSlot.slotId !== slotId) {
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
                <SlotHeader slot={selectedSlot} variant="large" />

                {/* 잔액 현황 카드 */}
                <SlotBalanceCard
                    remaining={selectedSlot.remainingBudget}
                    budget={selectedSlot.currentBudget}
                    color={SLOT_CATEGORIES[selectedSlot.slotId as keyof typeof SLOT_CATEGORIES]?.color || '#F1A791'}
                />

                {/* 누적 지출 그래프 */}
                <View style={styles.chartContainer}>
                    {isLoading ? (
                        <View style={styles.loadingCard}>
                            <Text style={styles.loadingText}>불러오는 중...</Text>
                        </View>
                    ) : dailySpending && dailySpending.transactions ? (
                        <SlotSpendingChart
                            data={dailySpending}
                            slotName={selectedSlot.name}
                            color={SLOT_CATEGORIES[selectedSlot.slotId as keyof typeof SLOT_CATEGORIES]?.color || '#F1A791'}
                            budget={selectedSlot.currentBudget}
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
                        <TransactionList transactions={transactions} slotId={slotId} />
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

