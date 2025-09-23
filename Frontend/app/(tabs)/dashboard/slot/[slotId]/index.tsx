import React from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSlotStore } from '@/src/store/useSlotStore';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import SlotHeader from '@/src/components/slot/SlotHeader';
import { Stack } from 'expo-router';
import SlotSpendingChart from '@/src/components/slot/SlotSpendingChart';
import SlotBalanceCard from '@/src/components/slot/SlotBalanceCard';
import { useSlotDailySpending } from '@/src/hooks/slots/useSlotDailySpending';
import TransactionList from '@/src/components/transaction/TransactionList';
import { SlotTransaction } from '@/src/types/slot';

// 더미 거래 데이터 생성 함수
const generateMockTransactions = (slotId: string, slotName: string): SlotTransaction[] => {
  const transactions: SlotTransaction[] = [];
  let remaining = 500000; // 예산에서 시작
  
  // 슬롯별로 다른 거래 패턴 생성
  const patterns = {
    '01': [ // 식비
      { summary: '맥도날드', amount: -12000, category: '패스트푸드' },
      { summary: '스타벅스', amount: -5500, category: '카페' },
      { summary: '김치찌개집', amount: -18000, category: '한식' },
      { summary: '편의점', amount: -3500, category: '간식' },
      { summary: '마트', amount: -25000, category: '장보기' },
      { summary: '치킨집', amount: -22000, category: '배달음식' },
      { summary: '일식당', amount: -35000, category: '일식' },
      { summary: '중식당', amount: -28000, category: '중식' },
    ],
    '18': [ // 데이트 비용
      { summary: '영화관', amount: -25000, category: '영화' },
      { summary: '카페', amount: -12000, category: '카페' },
      { summary: '레스토랑', amount: -85000, category: '외식' },
      { summary: '놀이공원', amount: -120000, category: '놀이공원' },
      { summary: '카페', amount: -8000, category: '카페' },
      { summary: '영화관', amount: -20000, category: '영화' },
    ],
    '02': [ // 교통비
      { summary: '지하철', amount: -1400, category: '대중교통' },
      { summary: '버스', amount: -1400, category: '대중교통' },
      { summary: '택시', amount: -8000, category: '택시' },
      { summary: '지하철', amount: -1400, category: '대중교통' },
      { summary: '버스', amount: -1400, category: '대중교통' },
    ],
    '07': [ // 저축
      { summary: '적금', amount: -100000, category: '저축' },
      { summary: '적금', amount: -100000, category: '저축' },
    ]
  };

  const pattern = patterns[slotId as keyof typeof patterns] || patterns['01'];
  
  // 9월 1일부터 30일까지 랜덤하게 거래 생성
  for (let day = 1; day <= 30; day++) {
    const date = `2025-09-${day.toString().padStart(2, '0')}`;
    const dayTransactions = Math.floor(Math.random() * 3) + 1; // 하루 1-3개 거래
    
    for (let i = 0; i < dayTransactions; i++) {
      const randomPattern = pattern[Math.floor(Math.random() * pattern.length)];
      remaining += randomPattern.amount;
      
      transactions.push({
        transactionId: `${slotId}-${date}-${i}`,
        date,
        amount: randomPattern.amount,
        remaining: Math.max(remaining, -50000), // 최소 -50,000원
        summary: randomPattern.summary,
        category: randomPattern.category,
      });
    }
  }
  
  // 날짜 내림차순으로 정렬 (최신순)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

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

    // 더미 거래 데이터 생성
    const mockTransactions = generateMockTransactions(slotId, selectedSlot?.slotName || '');

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
                    <TransactionList transactions={mockTransactions} />
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

