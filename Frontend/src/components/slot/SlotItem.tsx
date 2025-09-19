import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SlotData } from '@/src/types';
import { SLOT_CATEGORIES } from '@/src/constants/slots';
import { themes } from '@/src/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Spacing } from '@/src/constants';
import CircularProgress from '../common/CircularProgress';

type SlotItemProps = {
    slot: SlotData;
};

const SlotItem = ({ slot }: SlotItemProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];
    const category = SLOT_CATEGORIES[slot.slotId];

    const progress = slot.remain / slot.budget;
    const spent = slot.budget - slot.remain;

    return (
        <View style={[styles.card, theme.shadows.base, {
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.border.light,
        }]}>
          {/* 카드 상단: 제목과 옵션 메뉴 */}
          <View style={styles.cardHeader}>
            <Text style={[styles.name, { color: theme.colors.text.primary }]}>{slot.name}</Text>
            <TouchableOpacity style={styles.menuButton}>
              <View style={styles.menuDots}>
                <View style={[styles.dot, { backgroundColor: theme.colors.text.secondary }]} />
                <View style={[styles.dot, { backgroundColor: theme.colors.text.secondary }]} />
                <View style={[styles.dot, { backgroundColor: theme.colors.text.secondary }]} />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* 카드 하단: 원형 progress bar와 예산 정보 */}
          <View style={styles.cardContent}>
            {/* 왼쪽: 원형 progress bar */}
            <View style={styles.progressContainer}>
              <CircularProgress
                progress={progress}
                size={70}
                strokeWidth={7}
                color={category.color}
                backgroundColor={theme.colors.background.tertiary}
                icon={category.icon}
                iconSize={20}
              />
            </View>
            
            {/* 오른쪽: 예산 정보 (이전 버전) */}
            <View style={styles.budgetInfo}>
              <View style={styles.amountContainer}>
                <Text style={[styles.remain, { color: theme.colors.text.primary }]}>{slot.remain.toLocaleString()}원</Text>
                <Text style={[styles.budget, { color: theme.colors.text.secondary }]}>/ {slot.budget.toLocaleString()}원</Text>
              </View>
            </View>
          </View>
        </View>
    );
};

export default SlotItem;

const styles = StyleSheet.create({
    card: {
      borderRadius: 16,
      borderWidth: 2,
      padding: 16,
      marginBottom: 0, // SlotList에서 marginBottom을 관리
      marginHorizontal: Spacing.sm,
      justifyContent: 'flex-start',
      height: 120,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      position: 'relative',
    },
    name: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
    },
    menuButton: {
      position: 'absolute',
      right: 0,
      padding: 4,
    },
    menuDots: {
      flexDirection: 'column',
      gap: 3,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    cardContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    },
    progressContainer: {
      flex: 1,
      justifyContent: 'center',   // 세로 중앙 정렬
      alignItems: 'flex-start',       // 가로 중앙 정렬
      flexShrink: 0,
      alignSelf: 'center',        // 부모(cardContent) 높이에서 세로 중앙으로
      marginBottom: Spacing.sm,
    },
    budgetInfo: {
      flex: 1,
      justifyContent: 'flex-end',  // ← 하단 정렬
      alignItems: 'flex-end',      // 오른쪽 정렬
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    remain: {
      fontSize: 20,
      fontWeight: '700',
    },
    budget: {
      fontSize: 16,
    },
});
  
