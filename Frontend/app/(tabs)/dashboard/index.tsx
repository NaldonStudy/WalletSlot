import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { faker } from '@faker-js/faker';
import { Button } from '@/src/components';
import { themes, Spacing, Typography } from '@/src/constants/theme';
import { AccountSummary } from '@/src/components/account/AccountSummary';
import { BANK_CODES } from '@/src/constants/banks';
import { useAccounts, useSlots } from '@/src/hooks';
import type { UserAccount } from '@/src/types';
import AccountDonutChart from '@/src/components/chart/AccountDonutChart';
import AccountCarousel from '@/src/components/account/AccountCarousel';
import { UncategorizedSlotCard } from '@/src/components/slot/UncategorizedSlotCard';
import SlotList from '@/src/components/slot/SlotList';
import { useAccountBalance } from '@/src/hooks/useAccountBalance';

// 상수 정의
const UNCATEGORIZED_SLOT_ID = "25"; // 미분류 슬롯 ID

// 헤더 컴포넌트 분리 (메모이제이션)
const DashboardHeader = memo(({ userData, theme }: { userData: any, theme: any }) => (
  <View style={styles.header}>
    <Text style={[styles.greeting, { color: theme.colors.text.primary }]}>
      안녕하세요, {userData.userName}님!
    </Text>
    <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
      오늘의 지출 현황을 확인해보세요
    </Text>
  </View>
));

// 현실적인 샘플 데이터 생성
const generateUserData = () => {
  const koreanLastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
  const koreanFirstNames = ['민수', '영희', '철수', '수빈', '지현', '준호', '혜진', '동훈', '소영', '태현'];

  const lastName = faker.helpers.arrayElement(koreanLastNames);
  const firstName = faker.helpers.arrayElement(koreanFirstNames);
  return { userName: lastName + firstName };
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  // index state 관리
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasScrolledRef = useRef(false); // Track if carousel has been scrolled

  // 즉시 업데이트를 위한 콜백
  const handleIndexChange = useCallback((index: number) => {
    setSelectedIndex(index);
    hasScrolledRef.current = true; // Mark as scrolled
  }, []);

  // 스크롤 관련
  const scrollY = useRef(new Animated.Value(0)).current;
  const accountCarouselRef = useRef<View>(null);
  const [accountCarouselY, setAccountCarouselY] = useState(0);

  // 사용자 데이터와 슬롯 데이터를 한 번만 생성 (메모이제이션)
  const userData = useMemo(() => generateUserData(), []);

  // MSW API를 통한 계좌 데이터 조회
  const { linked } = useAccounts();
  const { accounts: rawAccounts, isLoading: isAccountsLoading } = linked;
  
  // 현재 선택된 계좌 데이터
  const currentAccount = rawAccounts?.[selectedIndex];
  
  // 현재 계좌 잔액 훅
  const {balance: realtimeBalance, isLoading: isBalanceLoading} = useAccountBalance(
    hasScrolledRef.current ? currentAccount?.accountId : undefined
  );
  
  // 현재 계좌의 슬롯 데이터 조회
  const { slots: allSlots, isLoading: isSlotsLoading } = useSlots(currentAccount?.accountId);

  // 슬롯 데이터를 일반 슬롯과 미분류 슬롯으로 분리
  const currentAccountSlots = allSlots.filter(slot => slot.slotId !== UNCATEGORIZED_SLOT_ID);
  const uncategorizedSlot = allSlots.find(slot => slot.slotId === UNCATEGORIZED_SLOT_ID);
  const uncategorizedAmount = uncategorizedSlot?.remaining || 0;

  // 잔액 검증: 슬롯 잔액 합계 + 미분류 잔액 = 계좌 잔액
  const slotBalanceSum = currentAccountSlots.reduce((sum, slot) => sum + slot.remaining, 0);
  const totalCalculatedBalance = slotBalanceSum + uncategorizedAmount;
  const accountBalance = currentAccount?.balance || 0;
  
  // AccountSummary용 데이터 (UserAccount 직접 사용)
  const currentAccountForSummary: UserAccount | undefined = currentAccount ? {
    ...currentAccount,
    balance: realtimeBalance ?? currentAccount.balance, // 실시간 잔액 우선, 없으면 초기 잔액
  } : undefined;
  
  // AccountCarousel용 데이터 변환 (React Query가 자동으로 최신 잔액 관리)
  const linkedAccountsForCarousel = rawAccounts.map((account: UserAccount) => ({
    bankCode: account.bankCode as keyof typeof BANK_CODES,
    accountName: account.accountAlias || account.bankName,
    accountNumber: account.accountNo,
    balance: account.balance, // React Query가 자동으로 최신 잔액으로 업데이트
  }));


  // require()로 로드된 이미지는 prefetch가 불필요함
  // Expo Image가 자동으로 캐싱하므로 별도 프리로딩 제거


  // 두 컴포넌트의 opacity는 하나의 scrollY를 interpolate해서 제어
  const summaryOpacity = scrollY.interpolate({
    inputRange: [accountCarouselY - 20, accountCarouselY + 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const carouselOpacity = scrollY.interpolate({
    inputRange: [accountCarouselY - 20, accountCarouselY + 20],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // 로딩 상태 처리 (계좌 데이터만 체크)
  if (isAccountsLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            계좌 정보를 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 계좌가 없는 경우 처리
  if (!rawAccounts || rawAccounts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            연동된 계좌가 없습니다.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentAccount) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            계좌 정보를 찾을 수 없습니다.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* 요약은 항상 렌더링해두고 opacity로만 표시 */}
      <Animated.View style={[styles.fixedHeader,
      {
        opacity: summaryOpacity,
        backgroundColor: theme.colors.background.primary,
      }]}>
        <View style={{ position: 'relative' }}>
          <View style={{ position: 'absolute', bottom: -50, width: '90%' }}>
            <UncategorizedSlotCard remain={uncategorizedAmount} unreadCount={3} />
          </View>
          {currentAccountForSummary && (
            <AccountSummary account={currentAccountForSummary} />
          )}
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* 헤더 */}
        <DashboardHeader userData={userData} theme={theme} />

        {/* 캐러셀 */}
        <Animated.View
          ref={accountCarouselRef}
          onLayout={(event) => {
            const { y } = event.nativeEvent.layout;
            setAccountCarouselY(y);
          }}
          style={
            {
              opacity: carouselOpacity,
            }
          }
        >
          <AccountCarousel
            accounts={linkedAccountsForCarousel}
            onIndexChange={handleIndexChange}
            initialIndex={selectedIndex}
          />
        </Animated.View>



        {/* 슬롯 현황 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>이번 달 슬롯 현황</Text>
          {/* 원형 그래프 */}
          <View style={[styles.chartPlaceholder, theme.shadows.base, {
            backgroundColor: theme.colors.background.tertiary,
            borderColor: theme.colors.border.light,
          }]}>
            <Text style={[styles.dateText, { color: theme.colors.text.primary }]}>2025.09.01 ~ 2025.09.30</Text>
            {isSlotsLoading ? (
              <View style={styles.slotLoadingContainer}>
                <Text style={[styles.slotLoadingText, { color: theme.colors.text.secondary }]}>
                  슬롯 정보를 불러오는 중...
                </Text>
              </View>
            ) : (
              <AccountDonutChart data={currentAccountSlots} />
            )}
          </View>
        </View>

        {/* 슬롯 리스트 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>슬롯 목록</Text>
          {isSlotsLoading ? (
            <View style={styles.slotLoadingContainer}>
              <Text style={[styles.slotLoadingText, { color: theme.colors.text.secondary }]}>
                슬롯 정보를 불러오는 중...
              </Text>
            </View>
          ) : (
            <SlotList slots={currentAccountSlots} />
          )}
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 60,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm, // UncategorizedSlotCard까지 커버하도록 늘림
    transformOrigin: 'top center',
  },
  fixedGreeting: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  fixedAccountSummary: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: 16,
    padding: Spacing.base,
  },
  header: {
    padding: Spacing.base,
    paddingTop: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
  },
  uncategorized: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.8,
  },
  section: {
    padding: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.base,
  },
  chartPlaceholder: {
    width: '100%',
    minHeight: 280,
    borderRadius: 16,
    justifyContent: 'flex-start',
    marginBottom: Spacing.base,
    padding: 20,
    elevation: 2, // Android 그림자
  },
  dateText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.sm,
    textAlign: 'center',
    alignSelf: 'center',
  },
  placeholderText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
  },
  placeholderSubtext: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  slotActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bottomSpacer: {
    height: 100, // 탭 바와의 간격
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.fontSize.lg,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    textAlign: 'center',
    color: '#ff6b6b',
  },
  slotLoadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    minHeight: 100,
  },
  slotLoadingText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
