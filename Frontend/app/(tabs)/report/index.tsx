// app/(tabs)/report/index.tsx

import { aiReportApi } from '@/src/api/report';
import { Button, LoadingIndicator } from '@/src/components';
import { BudgetOverview } from '@/src/components/report/BudgetOverview';
import { BudgetSuggestionCard } from '@/src/components/report/BudgetSuggestion';
import { CategoryAnalysis } from '@/src/components/report/CategoryAnalysis';
import { PeerComparisonCard } from '@/src/components/report/PeerComparison';
import { PersonalizedInsightCard } from '@/src/components/report/PersonalizedInsight';
import { SpendingReportHeader } from '@/src/components/report/SpendingReportHeader';
import { TopSpendingChart } from '@/src/components/report/TopSpendingChart';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import { useAccounts } from '@/src/hooks';
import React, { useEffect, useRef, useState } from 'react';
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

const ReportContent = React.memo(({ aiArchive, theme, onSectionLayout }: any) => {
  const reportItem = aiArchive?.reports?.find((r: any) => r.summary && r.insights);

  if (!reportItem) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorTitle, { color: theme.colors.text.primary }]}>리포트 데이터 오류</Text>
        <Text style={[styles.errorMessage, { color: theme.colors.text.secondary }]}>분석 가능한 리포트 데이터가 없습니다.</Text>
      </View>
    );
  }

  // 데이터 매핑
  const mappedBudgetComparison = {
    totalBudget: reportItem.summary?.totalBudget ?? 0,
    totalSpent: reportItem.summary?.totalSpent ?? 0,
    changePercent: reportItem.summary?.changePercent ?? 0,
    transactionCount: reportItem.summary?.transactionCount ?? 0,
  };

  const mappedCategoryAnalysis = reportItem.slots?.map((s: any) => ({
    categoryId: s.slotId || s.accountSlotId,
    categoryName: s.slotName,
    budgetAmount: s.budget ?? 0,
    spentAmount: s.spent ?? 0,
    spendingRatio: s.budget ? (s.spent ?? 0) / s.budget : 0,
    status: s.exceeded ? 'over' : 'optimal',
    changePercent: 0,
  })) || [];

  const totalSpent = reportItem.summary?.totalSpent ?? 0;
  const mappedTopSpendingCategories = (reportItem.summary?.top3Slots || []).map((slot: any) => ({
    categoryName: slot.slotName,
    amount: slot.spent ?? 0,
    // 전체 지출 대비 비율을 계산하고, 0으로 나누는 경우를 방지합니다.
    percentage: totalSpent > 0 ? Math.round(((slot.spent ?? 0) / totalSpent) * 100) : 0,
  }));

  return (
    <>
      <SpendingReportHeader period={reportItem.period} theme={theme} />
      
      <View onLayout={onSectionLayout('overview')}>
        <BudgetOverview budgetComparison={mappedBudgetComparison} theme={theme} />
      </View>
      <View onLayout={onSectionLayout('categories')}>
        <CategoryAnalysis categoryAnalysis={mappedCategoryAnalysis} theme={theme} />
      </View>
      <View onLayout={onSectionLayout('peers')}>
        <PeerComparisonCard peerComparison={reportItem.peerComparison} theme={theme} />
      </View>
      <View onLayout={onSectionLayout('top')}>
        <TopSpendingChart topSpendingCategories={mappedTopSpendingCategories} theme={theme} />
      </View>
      <View onLayout={onSectionLayout('suggest')}>
        <BudgetSuggestionCard budgetSuggestion={reportItem.budgetSuggestion} theme={theme} />
      </View>
      <View onLayout={onSectionLayout('insight')}>
        <PersonalizedInsightCard personalizedInsight={reportItem.insights} theme={theme} />
      </View>
    </>
  );
});


export default function ReportScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  
  const { linked } = useAccounts();
  
  const [aiMonths, setAiMonths] = useState<string[] | null>(null);
  const [aiArchive, setAiArchive] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<Error | null>(null);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showAccountList, setShowAccountList] = useState(false);

  const loadAiReports = async (accountId: string) => {
    if (!accountId) {
      setAiLoading(false);
      return;
    }

    setAiLoading(true);
    setAiError(null);
    try {
      const months = await aiReportApi.getAiReportMonths(accountId);
      const yearMonths = months?.yearMonths || [];
      setAiMonths(yearMonths);

      if (yearMonths.length > 0) {
        const targetYearMonth = yearMonths[0];
        const archive = await aiReportApi.getAiReportArchive(accountId, { yearMonth: targetYearMonth });
        setAiArchive(archive);
      } else {
        setAiArchive(null);
      }
    } catch (err: any) {
      console.error("Error loading AI reports:", err);
      setAiError(err instanceof Error ? err : new Error(String(err)));
      setAiMonths([]);
      setAiArchive(null);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!linked.isLoading && linked.accounts && linked.accounts.length > 0) {
      if (!selectedAccountId) {
        const firstId = (linked.accounts[0] as any).accountId || (linked.accounts[0] as any).id || (linked.accounts[0] as any).uuid;
        setSelectedAccountId(firstId || null);
      }
    }
  }, [linked.isLoading, linked.accounts]);
  
  useEffect(() => {
    if (selectedAccountId) {
      loadAiReports(selectedAccountId);
    }
  }, [selectedAccountId]);

  const [currentPeriodOffset, setCurrentPeriodOffset] = useState(0);

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
      if (selectedAccountId) {
        await loadAiReports(selectedAccountId);
      }
    } catch (err) {
      Alert.alert('오류', '데이터를 새로고침하는데 실패했습니다.');
    } finally {
      setRefreshing(false);
    }
  };

  const canGoPrevious = () => aiMonths && aiMonths.length > Math.abs(currentPeriodOffset) + 1;
  const canGoNext = () => currentPeriodOffset < 0;

  const goToPreviousPeriod = () => {
    if (canGoPrevious()) setCurrentPeriodOffset(prev => prev - 1);
  };

  const goToNextPeriod = () => {
    if (canGoNext()) setCurrentPeriodOffset(prev => prev + 1);
  };

  const formatPeriodLabel = (offset: number) => {
    if (!aiMonths || aiMonths.length === 0) return '기간 정보 없음';
    const idx = Math.abs(offset);
    if (idx >= aiMonths.length) return '기간 정보 없음';
    const [year, month] = aiMonths[idx].split('-');
    return `${year}년 ${parseInt(month, 10)}월`;
  };

  const onSectionLayout = (key: string) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    setSectionY(prev => ({ ...prev, [key]: y }));
  };

  const scrollToSection = (key: string) => {
    const y = sectionY[key] ?? 0;
    const target = Math.max(0, y - 80);
    scrollRef.current?.scrollTo({ y: target, animated: true });
    setActiveKey(key);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    const offset = 80;
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

  if (linked.isLoading || (aiLoading && !aiArchive)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <LoadingIndicator fullScreen text="데이터를 불러오는 중..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }] }>
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
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setShowAccountList(!showAccountList)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.pageTitle, { color: theme.colors.text.primary }]}>소비 리포트</Text>
                <Text style={[{ marginLeft: 8, fontSize: 12, color: theme.colors.text.secondary }]}>
                  {selectedAccountId ? ((linked.accounts || []).find((a: any) => ((a.accountId || a.id || a.uuid) === selectedAccountId))?.alias || '') : ''}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.pageSubtitle, { color: theme.colors.text.secondary }]}>
                {formatPeriodLabel(currentPeriodOffset)}
              </Text>
            </View>
            {showAccountList && (
              <View style={[styles.accountListPopup, { backgroundColor: theme.colors.background.primary, borderColor: theme.colors.gray[200] }]}>
                {(linked.accounts || []).map((acc: any) => {
                  const aid = acc.accountId || acc.id || acc.uuid;
                  const label = acc.alias || acc.bankName || aid;
                  return (
                    <TouchableOpacity key={aid} onPress={() => { setSelectedAccountId(aid); setShowAccountList(false); }} style={styles.accountListItem}>
                      <Text style={{ color: selectedAccountId === aid ? theme.colors.primary[600] : theme.colors.text.primary }}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
          
          <TouchableOpacity
            onPress={goToNextPeriod}
            disabled={!canGoNext()}
            style={[styles.periodButton, { opacity: canGoNext() ? 1 : 0.3 }]}
          >
            <Text style={[styles.periodButtonText, { color: theme.colors.primary[600] }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
        {aiLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LoadingIndicator text="리포트를 불러오는 중입니다..." />
          </View>
        ) : (!aiArchive || !aiArchive.reports || aiArchive.reports.length === 0) ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorTitle, { color: theme.colors.text.primary }]}>아직 작성된 소비 레포트가 없어요!</Text>
            <Text style={[styles.errorMessage, { color: theme.colors.text.secondary }]}>선택하신 계좌에 분석 가능한 데이터가 없습니다.</Text>
            <Button title="새로고침" onPress={handleRefresh} style={styles.retryButton} />
          </View>
        ) : (
          <ReportContent
            aiArchive={aiArchive}
            theme={theme}
            onSectionLayout={onSectionLayout}
          />
        )}
      </ScrollView>
      
      <View style={styles.floatingNavContainer}>
        <TouchableOpacity
          onPress={() => setShowSectionNav(!showSectionNav)}
          style={[ styles.mainFloatingButton, { backgroundColor: showSectionNav ? theme.colors.primary[600] : theme.colors.primary[500] }]}
        >
          <Text style={styles.floatingButtonIcon}>📊</Text>
        </TouchableOpacity>
        
        {showSectionNav && (
          <View style={[styles.sectionNavExpanded, { backgroundColor: theme.colors.background.primary }]}>
            {sections.map((section) => (
              <TouchableOpacity
                key={section.key}
                onPress={() => { scrollToSection(section.key); setShowSectionNav(false); }}
                style={[ styles.expandedNavItem, { backgroundColor: activeKey === section.key ? theme.colors.primary[100] : 'transparent', borderColor: theme.colors.gray[200] } ]}
              >
                <Text style={[ styles.expandedNavText, { color: activeKey === section.key ? theme.colors.primary[700] : theme.colors.text.primary }]}>
                  {section.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  fixedHeader: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    zIndex: 10,
    backgroundColor: 'white',
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
    paddingBottom: 100,
    flexGrow: 1,
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
    bottom: 76, 
    right: 0,
    width: 200,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  expandedNavItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
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
    minHeight: 400,
  },
  errorTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: Typography.fontSize.base,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
  },
  accountListPopup: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    width: 240,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DDDDDD',
    paddingVertical: 8,
    zIndex: 40,
    elevation: 10,
    backgroundColor: 'white',
  },
  accountListItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});