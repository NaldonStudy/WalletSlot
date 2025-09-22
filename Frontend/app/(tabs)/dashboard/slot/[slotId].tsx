// app/dashboard/slot/[slotId].tsx
import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSlotStore } from '@/src/store/useSlotStore';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import SlotHeader from '@/src/components/slot/SlotHeader';
import { Stack } from 'expo-router';
import SlotSpendingChart from '@/src/components/slot/SlotSpendingChart';
import SlotBalanceCard from '@/src/components/slot/SlotBalanceCard';
import { useSlotDailySpending } from '@/src/hooks/slots/useSlotDailySpending';

// 기간 계산 함수들
const getPeriodStartDate = (period: string, anchorDay: number | null) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    switch (period) {
        case 'weekly':
            const dayOfWeek = now.getDay();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(currentDate - dayOfWeek);
            return startOfWeek.toISOString().split('T')[0];

        case 'monthly':
            const anchor = anchorDay || 1;
            const startOfMonth = new Date(currentYear, currentMonth, anchor);
            if (anchor > currentDate) {
                startOfMonth.setMonth(currentMonth - 1);
            }
            return startOfMonth.toISOString().split('T')[0];

        case 'yearly':
            return `${currentYear}-01-01`;

        default:
            return null;
    }
};

const getPeriodEndDate = (period: string, anchorDay: number | null) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    switch (period) {
        case 'weekly':
            const dayOfWeek = now.getDay();
            const endOfWeek = new Date(now);
            endOfWeek.setDate(currentDate + (6 - dayOfWeek));
            return endOfWeek.toISOString().split('T')[0];

        case 'monthly':
            const anchor = anchorDay || 1;
            const endOfMonth = new Date(currentYear, currentMonth + 1, anchor - 1);
            if (anchor > currentDate) {
                endOfMonth.setMonth(currentMonth);
            }
            return endOfMonth.toISOString().split('T')[0];

        case 'yearly':
            return `${currentYear}-12-31`;

        default:
            return null;
    }
};

export default function SlotDetailScreen() {
    const { slotId } = useLocalSearchParams<{ slotId: string }>();
    const { selectedSlot } = useSlotStore();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];

    const { data: dailySpending, isLoading } = useSlotDailySpending(
        selectedSlot?.accountId, // 계좌 ID
        slotId
    );

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
            {/* SlotHeader 컴포넌트 사용 */}
            <SlotHeader slot={selectedSlot} variant="large" />

            {/* 잔액 현황 카드 */}
            <SlotBalanceCard
                remaining={selectedSlot.remaining}
                budget={selectedSlot.budget}
                color={selectedSlot.slotColor}
                startDate={getPeriodStartDate('monthly', 1) || undefined}
                endDate={getPeriodEndDate('monthly', 1) || undefined}
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
                        slotName={selectedSlot.slotName}
                        color={selectedSlot.slotColor}
                        budget={selectedSlot.budget}
                    />
                ) : (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>데이터 없음</Text>
                    </View>
                )}
            </View>
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>상세 거래 내역</Text>
            </View>


        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB", // 기본 배경 (테마 색상으로 덮어씌워짐)
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

