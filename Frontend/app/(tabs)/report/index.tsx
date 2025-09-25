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
  
  const { 
    data: reportData, 
    isLoading, 
    error, 
    refetch 
  } = useSpendingReport(!linked.isLoading);

  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const [quickBarHeight, setQuickBarHeight] = useState(0);
  const [sectionY, setSectionY] = useState<Record<string, number>>({});
  const [activeKey, setActiveKey] = useState<string>('overview');

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

  const onQuickBarLayout = (e: LayoutChangeEvent) => {
    setQuickBarHeight(e.nativeEvent.layout.height);
  };

  const onSectionLayout = (key: string) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    setSectionY(prev => ({ ...prev, [key]: y }));
  };

  const scrollToSection = (key: string) => {
    const y = sectionY[key] ?? 0;
    const target = Math.max(0, y - quickBarHeight - 8);
    scrollRef.current?.scrollTo({ y: target, animated: true });
    setActiveKey(key);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = e.nativeEvent.contentOffset.y;
    // Determine the section that is currently at/above the top (consider sticky quick bar)
    const offset = quickBarHeight + 12;
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
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Spacing.sm, flexGrow: 1 }]}
        stickyHeaderIndices={[0]}
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
        <View onLayout={onQuickBarLayout} style={[styles.quickBar, { backgroundColor: theme.colors.background.primary, borderBottomColor: theme.colors.gray[200] }]}>          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickBarContent}>
            {sections.map(s => (
              <Button
                key={s.key}
                title={s.label}
                size="sm"
                variant={activeKey === s.key ? 'primary' : 'outline'}
                onPress={() => scrollToSection(s.key)}
                style={styles.quickButton}
                textStyle={styles.quickButtonText}
              />
            ))}
          </ScrollView>
        </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ✅ CHANGED: overflow 속성을 모두 제거하고 표준 flex 레이아웃으로 변경
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // 테마 대신 고정 배경색 지정
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['4xl'], // 하단 여백 충분히 확보
  },
  quickBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  quickBarContent: {
    paddingHorizontal: Spacing.base,
  },
  quickButton: {
    paddingHorizontal: Spacing.base,
    marginRight: 8,
  },
  quickButtonText: {
    fontWeight: Typography.fontWeight.medium,
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