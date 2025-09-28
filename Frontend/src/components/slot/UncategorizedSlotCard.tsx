import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import { router } from 'expo-router';
import { useSlotStore } from '@/src/store/useSlotStore';
import { useAccountSelectionStore } from '@/src/store';
import { UNCATEGORIZED_SLOT_ID } from '@/src/constants/slots';
import { useUncategorizedNotificationCount } from '@/src/hooks/notifications/useUncategorizedNotificationCount';

type UncategorizedSlotCardProps = {
    remain: number;
    unreadCount: number;
    accountId?: string;
    onPress?: () => void;
}


export const UncategorizedSlotCard = ({ remain, unreadCount, accountId, onPress }: UncategorizedSlotCardProps) => {
    const colorScheme = useColorScheme() ?? "light";
    const theme = themes[colorScheme];
    
    // 계좌 선택 스토어 사용
    const { setSelectedAccount, getCurrentAccountId } = useAccountSelectionStore();

    // 미분류 슬롯 관련 알림 개수 조회
    const { data: notificationData, isLoading: isNotificationLoading } = useUncategorizedNotificationCount();
    
    // 미분류 슬롯 관련 알림 개수
    const actualUnreadCount = notificationData?.data?.count || 0;

    const handlePress = () => {
      // 파라미터로 전달된 accountId가 있으면 우선 사용, 없으면 스토어에서 가져오기
      const finalAccountId = accountId || getCurrentAccountId();
      
      if (!finalAccountId) return;
      
      // 현재 계좌 정보를 스토어에 저장
      setSelectedAccount(finalAccountId, UNCATEGORIZED_SLOT_ID);
      
      // Store에 미분류 슬롯 정보 저장 (다른 슬롯들과 동일한 구조로)
      // 실제 슬롯 데이터에서 accountSlotId를 가져와야 하지만, 
      // 현재는 UNCATEGORIZED_SLOT_ID를 사용하고 슬롯 상세 화면에서 실제 데이터로 교체됨
      useSlotStore.getState().setSelectedSlot({
        slotId: UNCATEGORIZED_SLOT_ID,
        name: '미분류',
        accountSlotId: UNCATEGORIZED_SLOT_ID, // 임시값, 실제로는 슬롯 상세 화면에서 교체됨
        customName: '미분류',
        initialBudget: 0,
        currentBudget: 0,
        spent: 0,
        remainingBudget: remain,
        exceededBudget: 0,
        budgetChangeCount: 0,
        isSaving: false,
        isCustom: false,
        isBudgetExceeded: false,
        accountId: finalAccountId
      });

      // 미분류 슬롯 상세 페이지로 이동
      router.push({
        pathname: `/dashboard/slot/[slotId]`,
        params: { slotId: UNCATEGORIZED_SLOT_ID, accountId: finalAccountId },
      });
    };
  
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress || handlePress}
        style={[
          styles.card,
          theme.shadows.base,
          { 
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.border.light,
            borderWidth: 1,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          },
        ]}
      >
        {/* 하단 row: 왼쪽 타이틀+뱃지, 오른쪽 잔액 */}
        <View style={styles.bottomRow}>
          <View style={styles.left}>
            <Text style={[styles.name, { color: theme.colors.text.primary }]}>
              미분류 금액
            </Text>
            {actualUnreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{actualUnreadCount}</Text>
              </View>
            )}
          </View>
  
          <Text style={[styles.amount, { color: theme.colors.text.primary }]}>
            {remain.toLocaleString()}원
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  const styles = StyleSheet.create({
    card: {
      marginHorizontal: Spacing.base,
      marginTop: Spacing.sm,
      borderRadius: 12,
      padding: Spacing.base,
      width: "90%", // 부모 컨테이너의 90% 너비로 설정
      minHeight: 80, // 카드 높이 확보
      justifyContent: "flex-end", // 하단에 row 붙이기
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
    },
    name: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.medium,
    },
    badge: {
      marginLeft: Spacing.xs,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "red",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },
    badgeText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
    },
    amount: {
      fontSize: Typography.fontSize.lg,
      fontWeight: Typography.fontWeight.bold,
    },
  });