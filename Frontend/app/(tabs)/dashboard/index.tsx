import AccountCarousel from '@/src/components/account/AccountCarousel';
import { AccountSummary } from '@/src/components/account/AccountSummary';
import AccountDonutChart from '@/src/components/chart/AccountDonutChart';
import SlotList from '@/src/components/slot/SlotList';
import { UncategorizedSlotCard } from '@/src/components/slot/UncategorizedSlotCard';
import { BANK_CODES } from '@/src/constants/banks';
import { UNCATEGORIZED_SLOT_ID } from '@/src/constants/slots';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import { useAccountBalance, useAccounts, useSlots, useUserProfile } from '@/src/hooks';
import type { UserAccount, SlotData } from '@/src/types';
import { profileApi } from '@/src/api/profile';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, useColorScheme, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 헤더 컴포넌트 분리 (메모이제이션)
const DashboardHeader = memo(({ userProfile, theme }: { userProfile: any, theme: any }) => (
  <View style={styles.header}>
    <Text style={[styles.greeting, { color: theme.colors.text.primary }]}>
      안녕하세요, {userProfile?.name || '사용자'}님!
    </Text>
    <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
      오늘의 지출 현황을 확인해보세요
    </Text>
  </View>
));

DashboardHeader.displayName = 'DashboardHeader';

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
  const mainScrollViewRef = useRef<ScrollView>(null);

  // 사용자 프로필 데이터 조회
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();

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

  // 기준일 조회 및 날짜 범위 계산
  const [dateRange, setDateRange] = useState<string>('2025.09.01 ~ 2025.09.30');
  
  React.useEffect(() => {
    const fetchBaseDayAndCalculateRange = async () => {
      try {
        const response = await profileApi.getBaseDay();
        
        if (!response || typeof response.baseDay !== 'number') {
          return; // 기본값 유지
        }
        
        const baseDay = response.baseDay;
        const now = new Date();
        const currentDay = now.getDate();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-based
        
        let startDate: Date;
        let endDate: Date;
        
        if (currentDay < baseDay) {
          // 현재 날짜가 기준일보다 이전이면 전달 기준일부터 이번 달 기준일 전까지
          startDate = new Date(currentYear, currentMonth - 1, baseDay);
          endDate = new Date(currentYear, currentMonth, baseDay - 1);
        } else {
          // 현재 날짜가 기준일 이후면 이번 달 기준일부터 다음 달 기준일 전까지
          startDate = new Date(currentYear, currentMonth, baseDay);
          endDate = new Date(currentYear, currentMonth + 1, baseDay - 1);
        }
        
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          return `${year}.${month}.${day}`;
        };
        
        const formattedRange = `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
        setDateRange(formattedRange);
      } catch (error) {
        // 에러 시 기본값 유지
      }
    };
    
    fetchBaseDayAndCalculateRange();
  }, []);

  // 슬롯 데이터를 일반 슬롯과 미분류 슬롯으로 분리
  const currentAccountSlots = allSlots.filter(slot => slot.slotId !== UNCATEGORIZED_SLOT_ID);
  const uncategorizedSlot = allSlots.find(slot => slot.slotId === UNCATEGORIZED_SLOT_ID);
  const uncategorizedAmount = uncategorizedSlot?.remainingBudget || 0;

  // 툴팁 상태 관리
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);

  // 화면 터치 시 툴팁 닫기
  const handleScreenPress = useCallback(() => {
    setOpenTooltipId(null);
  }, []);

  // 슬롯 프레스 핸들러 (도넛 차트에서 슬롯 클릭 시)
  const handleSlotPress = useCallback((slot: SlotData) => {
    console.log('[handleSlotPress] 슬롯 클릭:', slot.name, slot.slotId);
    
    // 툴팁 닫기
    setOpenTooltipId(null);
    
    // 해당 슬롯의 인덱스 찾기
    const slotIndex = currentAccountSlots.findIndex(s => s.slotId === slot.slotId);
    console.log('[handleSlotPress] 슬롯 인덱스:', slotIndex);
    
    if (slotIndex !== -1 && mainScrollViewRef.current) {
      // 슬롯 리스트 섹션으로 스크롤 (대략적인 위치 계산)
      // 헤더 + 캐러셀 + 슬롯 현황 섹션 높이 + 슬롯 목록 제목 + 슬롯 아이템들
      const baseOffset = 400; // 헤더, 캐러셀, 차트 섹션의 대략적인 높이
      const slotItemHeight = 140; // 각 슬롯 아이템의 대략적인 높이
      const scrollY = baseOffset + (slotIndex * slotItemHeight);
      
      console.log('[handleSlotPress] 스크롤 위치:', scrollY);
      
      mainScrollViewRef.current.scrollTo({ y: scrollY, animated: true });
    } else {
      console.log('[handleSlotPress] 스크롤 실패 - slotIndex:', slotIndex, 'mainScrollViewRef:', !!mainScrollViewRef.current);
    }
  }, [currentAccountSlots]);
  
  // AccountSummary용 데이터 (UserAccount 직접 사용)
  const currentAccountForSummary: UserAccount | undefined = currentAccount ? {
    ...currentAccount,
    accountBalance: realtimeBalance ? String(realtimeBalance) : currentAccount.accountBalance, // 실시간 잔액 우선
  } as UserAccount : undefined;
  
  // AccountCarousel용 데이터 변환 (React Query가 자동으로 최신 잔액 관리)
  const linkedAccountsForCarousel = (rawAccounts || []).map((account: UserAccount) => ({
    bankId: account.bankId as keyof typeof BANK_CODES,
    accountName: account.alias, // normalizeAccountList에서 이미 처리됨
    accountNumber: account.accountNo,
    balance: Number(account.accountBalance ?? 0),
  }));
  


  // require()로 로드된 이미지는 prefetch가 불필요함
  // Expo Image가 자동으로 캐싱하므로 별도 프리로딩 제거


  // 두 컴포넌트의 opacity는 하나의 scrollY를 interpolate해서 제어
  const summaryOpacity = scrollY.interpolate({
    inputRange: [accountCarouselY - 50, accountCarouselY - 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const carouselOpacity = scrollY.interpolate({
    inputRange: [accountCarouselY - 50, accountCarouselY - 20],
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
            <UncategorizedSlotCard 
              remain={uncategorizedAmount} 
              unreadCount={3} 
              accountId={currentAccount?.accountId}
            />
          </View>
          {currentAccountForSummary && (
            <AccountSummary account={currentAccountForSummary} />
          )}
        </View>
      </Animated.View>

      <Animated.ScrollView
        ref={mainScrollViewRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        onTouchStart={handleScreenPress}
      >
        {/* 헤더 */}
        <DashboardHeader userProfile={userProfile} theme={theme} />

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
            <Text style={[styles.dateText, { color: theme.colors.text.primary }]}>{dateRange}</Text>
            {isSlotsLoading ? (
              <View style={styles.slotLoadingContainer}>
                <Text style={[styles.slotLoadingText, { color: theme.colors.text.secondary }]}>
                  슬롯 정보를 불러오는 중...
                </Text>
              </View>
            ) : (
              <AccountDonutChart data={currentAccountSlots} onSlotPress={handleSlotPress} />
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
            <View style={styles.slotListContainer}>
              <SlotList 
                slots={currentAccountSlots} 
                accountId={currentAccount.accountId}
                openTooltipId={openTooltipId}
                setOpenTooltipId={setOpenTooltipId}
              />
            </View>
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
  slotListContainer: {
    // 슬롯 리스트 컨테이너
  },
});
