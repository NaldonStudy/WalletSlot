import { Button } from '@/src/components';
import { BudgetOverview } from '@/src/components/report/BudgetOverview';
import { BudgetSuggestionCard } from '@/src/components/report/BudgetSuggestion';
import { CategoryAnalysis } from '@/src/components/report/CategoryAnalysis';
import { PeerComparisonCard } from '@/src/components/report/PeerComparison';
import { PersonalizedInsightCard } from '@/src/components/report/PersonalizedInsight';
import { SpendingReportHeader } from '@/src/components/report/SpendingReportHeader';
import { TopSpendingChart } from '@/src/components/report/TopSpendingChart';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import { useAccounts, useSpendingReport } from '@/src/hooks';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  if (linked.isLoading || (isLoading && !reportData)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            {linked.isLoading ? '계좌 정보를 불러오고 있어요...' : '소비 레포트를 생성하고 있어요...'}
          </Text>
        </View>
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
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Spacing.lg + 4, flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
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
        <BudgetOverview 
          budgetComparison={reportData.budgetComparison}
          theme={theme}
        />
        <CategoryAnalysis 
          categoryAnalysis={reportData.categoryAnalysis}
          theme={theme}
        />
        <PeerComparisonCard 
          peerComparison={reportData.peerComparison}
          theme={theme}
        />
        <TopSpendingChart 
          topSpendingCategories={reportData.topSpendingCategories}
          theme={theme}
        />
        <BudgetSuggestionCard 
          budgetSuggestion={reportData.budgetSuggestion}
          theme={theme}
        />
        <PersonalizedInsightCard 
          personalizedInsight={reportData.personalizedInsight}
          theme={theme}
        />
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['4xl'], // 하단 여백 충분히 확보
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.base,
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