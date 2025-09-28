import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router , Stack } from 'expo-router';
import { useSlotStore } from '@/src/store/useSlotStore';
import { themes, Spacing } from '@/src/constants/theme';
import { useSlots } from '@/src/hooks/slots/useSlots';
import { slotApi } from '@/src/api/slot';
import { SlotHistoryItem } from '@/src/types';

// API 응답의 SlotHistoryItem을 UI에서 사용하기 위한 확장 인터페이스
interface BudgetHistoryItem extends SlotHistoryItem {
  changeAmount: number;
  changeType: 'increase' | 'decrease';
}

export default function SlotHistoryScreen() {
  const { slotId } = useLocalSearchParams<{ slotId: string }>();
  const { selectedSlot } = useSlotStore();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  
  const [historyData, setHistoryData] = useState<BudgetHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 현재 슬롯 정보 가져오기
  const { slots, isLoading: slotsLoading } = useSlots(selectedSlot?.accountId || '');
  const currentSlot = slots?.find((slot: any) => slot.accountSlotId === slotId) || selectedSlot;

  useEffect(() => {
    fetchSlotHistory();
  }, [slotId, selectedSlot?.accountId]);

  const fetchSlotHistory = async () => {
    if (!selectedSlot?.accountId || !selectedSlot?.accountSlotId) {
      setError('슬롯 정보를 찾을 수 없습니다.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // 디버깅을 위한 로그
      console.log('[SlotHistoryScreen] API 호출 파라미터:', {
        accountId: selectedSlot.accountId,
        accountSlotId: selectedSlot.accountSlotId,
        urlSlotId: slotId,
        selectedSlot: selectedSlot
      });
      
      // 실제 API 호출 - accountSlotId 사용
      const response = await slotApi.getSlotHistory(selectedSlot.accountId, selectedSlot.accountSlotId);
      
      if (response.success && response.data) {
        // API 응답을 UI에서 사용할 수 있는 형태로 변환
        const transformedData: BudgetHistoryItem[] = response.data.history.map((item) => {
          const changeAmount = item.newBudget - item.oldBudget;
          return {
            ...item,
            changeAmount,
            changeType: changeAmount > 0 ? 'increase' : 'decrease'
          };
        });
        
        setHistoryData(transformedData);
      } else {
        setError('히스토리 데이터를 불러올 수 없습니다.');
      }
    } catch (error: any) {
      console.error('[SlotHistoryScreen] 히스토리 조회 실패:', error);
      
      // API가 아직 준비되지 않은 경우를 위한 임시 처리
      if (error.message?.includes('리소스를 찾을 수 없습니다') || error.message?.includes('404')) {
        console.log('[SlotHistoryScreen] API가 아직 준비되지 않음, 빈 데이터로 처리');
        setHistoryData([]);
      } else {
        setError('히스토리를 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return Math.abs(amount).toLocaleString();
  };

  const renderHistoryItem = ({ item }: { item: BudgetHistoryItem }) => (
    <View style={[
      styles.historyItem,
      theme.shadows.base,
      {
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.light,
      }
    ]}>
      <View style={styles.historyHeader}>
        <View style={styles.changeInfo}>
          <Text style={[
            styles.changeType,
            {
              color: item.changeType === 'increase' ? '#DC2626' : '#10B981',
              backgroundColor: item.changeType === 'increase' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(16, 185, 129, 0.1)'
            }
          ]}>
            {item.changeType === 'increase' ? '증액' : '축소'}
          </Text>
          <Text style={[styles.changeAmount, { color: theme.colors.text.primary }]}>
            {formatAmount(item.changeAmount)}원
          </Text>
        </View>
        <Text style={[styles.changeDate, { color: theme.colors.text.secondary }]}>
          {formatDate(item.changedAt)}
        </Text>
      </View>
      
      <View style={styles.budgetInfo}>
        <View style={styles.budgetRow}>
          <Text style={[styles.budgetLabel, { color: theme.colors.text.secondary }]}>
            이전 예산:
          </Text>
          <Text style={[styles.budgetValue, { color: theme.colors.text.primary }]}>
            {formatAmount(item.oldBudget)}원
          </Text>
        </View>
        <View style={styles.budgetRow}>
          <Text style={[styles.budgetLabel, { color: theme.colors.text.secondary }]}>
            변경 예산:
          </Text>
          <Text style={[styles.budgetValue, { color: theme.colors.text.primary }]}>
            {formatAmount(item.newBudget)}원
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <Stack.Screen
          options={{
            title: "변경 내역",
            headerBackTitle: "",
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            변경 내역을 불러오는 중...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <Stack.Screen
        options={{
          title: `${currentSlot?.name || currentSlot?.customName || '슬롯'} 예산 변경 내역`,
          headerBackTitle: "",
        }}
      />
      
      {historyData.length > 0 && (
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            총 {historyData.length}번 변경하셨어요!
          </Text>
          <View style={[styles.warningContainer, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <Text style={[styles.warningText, { color: '#DC2626' }]}>
              ⚠️ 예산을 자주 변경하면{'\n'}계획적인 소비 습관 형성에 방해가 될 수 있어요
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={historyData}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.slotHistoryId}
        contentContainerStyle={historyData.length > 0 ? styles.listContainer : styles.emptyListContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image 
              source={require('@/src/assets/images/dashboard/NotBudgetChange.png')}
              style={styles.emptyImage}
              contentFit="contain"
              transition={200}
              cachePolicy="memory-disk"
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
              예산 변경 내역이 없어요
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
              계획적인 소비 습관을 유지하고 계시네요!{'\n'}앞으로도 꾸준히 관리해보세요.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.base,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
  },
  warningContainer: {
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  praiseContainer: {
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  praiseText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    padding: Spacing.base,
    gap: Spacing.base,
  },
  emptyListContainer: {
    flex: 1,
  },
  historyItem: {
    padding: Spacing.base,
    borderRadius: 12,
    borderWidth: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  changeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  changeType: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  changeAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  changeDate: {
    fontSize: 14,
  },
  budgetInfo: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  emptyImage: {
    width: 250,
    height: 250,
    marginBottom: Spacing.lg,
    // 화질 개선을 위한 스타일
    transform: [{ scale: 1 }], // 픽셀 정렬
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
