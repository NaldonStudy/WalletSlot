import { Button, LoadingIndicator } from '@/src/components';
import { BudgetOverview } from '@/src/components/report/BudgetOverview';
import { BudgetSuggestionCard } from '@/src/components/report/BudgetSuggestion';
import { CategoryAnalysis } from '@/src/components/report/CategoryAnalysis';
import { PeerComparisonCard } from '@/src/components/report/PeerComparison';
import { PersonalizedInsightCard } from '@/src/components/report/PersonalizedInsight';
import { SpendingReportHeader } from '@/src/components/report/SpendingReportHeader';
import { TopSpendingChart } from '@/src/components/report/TopSpendingChart';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import { useAccounts, useSpendingReport } from '@/src/hooks';
import React, { useRef, useState } from 'react';
import {
  Alert,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * 월별 지출 리포트를 종합적으로 분석하여 제공하는 메인 화면
 * 
 * 주요 기능:
 * - 예산 대비 실제 지출 현황 요약
 * - 슬롯별 예산 사용 분석 및 상태 표시
 * - 상위 지출 카테고리 랭킹 차트
 * - 동일 그룹 또래와의 지출 비교
 * - AI 기반 개인화 인사이트 및 다음 달 예산 제안
 * - Pull-to-refresh로 최신 데이터 갱신
 * 
 * 데이터 의존성:
 * - useAccounts: 연결된 계좌 정보 필요
 * - useSpendingReport: 지출 리포트 데이터 조회
 */
export default function ReportScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  
  const { linked } = useAccounts();
  
  // 현재 기간 상태 관리
  const [currentPeriodOffset, setCurrentPeriodOffset] = useState(0); // 0: 최신, -1: 이전달, -2: 그 이전달...
  
  const { 
    data: reportData, 
    isLoading, 
    error, 
    refetch 
  } = useSpendingReport(!linked.isLoading, currentPeriodOffset);

  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [sectionY, setSectionY] = useState<Record<string, number>>({});
  const [activeKey, setActiveKey] = useState<string>('overview');
  const [showSectionNav, setShowSectionNav] = useState(false);

  const sections = [
    { key: 'overview', label: '예산 요약' },
    { key: 'categories', label: '카테고리 분석' },
    { key: 'peers', label: '또래 비교' },
    { key: 'top', label: '상위 지출' },
    { key: 'suggest', label: '예산 제안' },
    { key: 'insight', label: '인사이트' },
  ] as const;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      Alert.alert('오류', '데이터를 새로고침하는데 실패했습니다.');
    } finally {
      setRefreshing(false);
    }
  };

  // 기간 네비게이션 함수들
  const canGoPrevious = () => {
    // TODO: 실제로는 서버에서 사용 가능한 기간 데이터를 확인해야 함
    return currentPeriodOffset > -12; // 최대 12개월 전까지
  };

  const canGoNext = () => {
    return currentPeriodOffset < 0; // 최신 기간이 아닌 경우에만
  };

  const goToPreviousPeriod = () => {
    if (canGoPrevious()) {
      setCurrentPeriodOffset(prev => prev - 1);
    }
  };

  const goToNextPeriod = () => {
    if (canGoNext()) {
      setCurrentPeriodOffset(prev => prev + 1);
    }
  };

  const formatPeriodLabel = (offset: number) => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + offset, now.getDate());
    return `${targetDate.getFullYear()}년 ${targetDate.getMonth() + 1}월`;
  };

  const onSectionLayout = (key: string) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    setSectionY(prev => ({ ...prev, [key]: y }));
  };

  const scrollToSection = (key: string) => {
    const y = sectionY[key] ?? 0;
    const target = Math.max(0, y - 80); // 고정 헤더 높이만큼 오프셋
    scrollRef.current?.scrollTo({ y: target, animated: true });
    setActiveKey(key);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    const offset = 80; // 고정 헤더 높이
    const candidates = sections
      .map(s => ({ key: s.key, y: sectionY[s.key] ?? Number.POSITIVE_INFINITY }))
      .filter(s => Number.isFinite(s.y))
      .sort((a, b) => a.y - b.y);

    let current = activeKey;
    for (let i = 0; i < candidates.length; i++) {
      if (scrollY + offset >= candidates[i].y) {
        current = candidates[i].key;
      } else {
        break;
      }
    }
    if (current !== activeKey) setActiveKey(current);
  };

  if (linked.isLoading || (isLoading && !reportData)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <LoadingIndicator 
          fullScreen
          text={linked.isLoading ? '계좌 정보를 불러오고 있어요...' : '소비 레포트를 생성하고 있어요...'}
        />
      </SafeAreaView>
    );
  }

  if (error || !reportData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: theme.colors.text.primary }]}>
            앗, 문제가 발생했어요
          </Text>
          <Text style={[styles.errorMessage, { color: theme.colors.text.secondary }]}>
            소비 레포트를 불러올 수 없습니다.{'\n'}잠시 후 다시 시도해주세요.
          </Text>
          <Button
            title="다시 시도"
            onPress={handleRefresh}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }] }>
      {/* 간소화된 헤더: 기간 네비게이션만 */}
      <View style={[styles.fixedHeader, { backgroundColor: theme.colors.background.primary, borderBottomColor: theme.colors.gray[200] }]}>
        <View style={styles.periodNavigation}>
          <TouchableOpacity
            onPress={goToPreviousPeriod}
            disabled={!canGoPrevious()}
            style={[styles.periodButton, { opacity: canGoPrevious() ? 1 : 0.3 }]}
          >
            <Text style={[styles.periodButtonText, { color: theme.colors.primary[600] }]}>‹</Text>
          </TouchableOpacity>
          
          <View style={styles.periodInfo}>
            <Text style={[styles.pageTitle, { color: theme.colors.text.primary }]}>
              소비 리포트
            </Text>
            <Text style={[styles.pageSubtitle, { color: theme.colors.text.secondary }]}>
              {formatPeriodLabel(currentPeriodOffset)}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={goToNextPeriod}
            disabled={!canGoNext()}
            style={[styles.periodButton, { opacity: canGoNext() ? 1 : 0.3 }]}
          >
            <Text style={[styles.periodButtonText, { color: theme.colors.primary[600] }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Spacing.sm, flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        <SpendingReportHeader 
          period={reportData.period}
          theme={theme}
        />
        <View onLayout={onSectionLayout('overview')}>
          <BudgetOverview 
            budgetComparison={reportData.budgetComparison}
            theme={theme}
          />
        </View>
        <View onLayout={onSectionLayout('categories')}>
          <CategoryAnalysis 
            categoryAnalysis={reportData.categoryAnalysis}
            theme={theme}
          />
        </View>
        <View onLayout={onSectionLayout('peers')}>
          <PeerComparisonCard 
            peerComparison={reportData.peerComparison}
            theme={theme}
          />
        </View>
        <View onLayout={onSectionLayout('top')}>
          <TopSpendingChart 
            topSpendingCategories={reportData.topSpendingCategories}
            theme={theme}
          />
        </View>
        <View onLayout={onSectionLayout('suggest')}>
          <BudgetSuggestionCard 
            budgetSuggestion={reportData.budgetSuggestion}
            theme={theme}
          />
        </View>
        <View onLayout={onSectionLayout('insight')}>
          <PersonalizedInsightCard 
            personalizedInsight={reportData.personalizedInsight}
            theme={theme}
          />
        </View>
      </ScrollView>
      
      {/* 플로팅 섹션 네비게이션 */}
      <View style={styles.floatingNavContainer}>
        <TouchableOpacity
          onPress={() => setShowSectionNav(!showSectionNav)}
          style={[
            styles.mainFloatingButton, 
            { 
              backgroundColor: showSectionNav ? theme.colors.primary[600] : theme.colors.primary[500] 
            }
          ]}
        >
          <Text style={styles.floatingButtonIcon}>📊</Text>
        </TouchableOpacity>
        
        {showSectionNav && (
          <View style={[styles.sectionNavExpanded, { backgroundColor: theme.colors.background.primary }]}>
            {sections.map((section, index) => (
              <TouchableOpacity
                key={section.key}
                onPress={() => {
                  scrollToSection(section.key);
                  setShowSectionNav(false);
                }}
                style={[
                  styles.expandedNavItem,
                  {
                    backgroundColor: activeKey === section.key ? theme.colors.primary[100] : 'transparent',
                    borderColor: theme.colors.gray[200]
                  }
                ]}
              >
                <Text style={[
                  styles.expandedNavText,
                  { color: activeKey === section.key ? theme.colors.primary[700] : theme.colors.text.primary }
                ]}>
                  {section.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <TouchableOpacity
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          style={[styles.secondaryFloatingButton, { backgroundColor: theme.colors.gray[100] }]}
        >
          <Text style={styles.floatingButtonIcon}>⬆️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ✅ CHANGED: overflow 속성을 모두 제거하고 표준 flex 레이아웃으로 변경
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // 테마 대신 고정 배경색 지정
  },
  fixedHeader: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  periodNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  periodButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  periodButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  periodInfo: {
    flex: 1,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: 100, // 하단 네비게이션 공간 확보
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: 30,
    right: 16,
    alignItems: 'flex-end',
  },
  mainFloatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom: 8,
  },
  secondaryFloatingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  floatingButtonIcon: {
    fontSize: 24,
  },
  sectionNavExpanded: {
    position: 'absolute',
    bottom: 76, // 메인 버튼 위쪽에 배치
    right: 0,
    width: 200,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    paddingVertical: 8,
  },
  expandedNavItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  expandedNavText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.normal,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
});