import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SlotData } from '@/src/types';
import { themes } from '@/src/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SLOT_CATEGORIES, Spacing } from '@/src/constants';
import CircularProgress from '../common/CircularProgress';
import WarningIcon from '@/src/assets/icons/common/warning.svg';
import ActionTooltip from '../common/ActionTooltip';

type SlotItemProps = {
  slot: SlotData;
  isTooltipOpen?: boolean;
  onMenuPress?: () => void;
  onEdit?: () => void;
  onHistory?: () => void;
};

const SlotItem = ({ slot, isTooltipOpen = false, onMenuPress, onEdit, onHistory }: SlotItemProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  // 안전한 progress 계산
  const currentBudget = slot.currentBudget ?? 0;
  const remainingBudget = slot.remainingBudget ?? 0;
  const progress = currentBudget > 0 ? Math.max(0, Math.min(1, remainingBudget / currentBudget)) : 0;
  const isOverBudget = remainingBudget < 0;
  const slotColor = SLOT_CATEGORIES[slot.slotId as keyof typeof SLOT_CATEGORIES]?.color || '#F1A791';
  const slotIcon = SLOT_CATEGORIES[slot.slotId as keyof typeof SLOT_CATEGORIES]?.icon;
  const slotName = slot.customName || slot.name;
  return (
    <View style={[styles.card, theme.shadows.base, {
      backgroundColor: isOverBudget ? '#FFF5F5' : theme.colors.background.primary,
      borderColor: isOverBudget ? '#FF4444' : theme.colors.border.light,
      borderWidth: isOverBudget ? 3 : 1,
      shadowColor: isOverBudget ? '#FF4444' : 'transparent',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isOverBudget ? 0.2 : 0,
      shadowRadius: isOverBudget ? 4 : 0,
      elevation: isOverBudget ? 4 : 0,
    }]}>
      {/* 카드 상단: 제목과 옵션 메뉴 */}
      <View style={styles.cardHeader}>
        <View style={styles.nameWrapper}>
          <Text style={[
            styles.name,
            {
              color: isOverBudget ? '#CC0000' : theme.colors.text.primary,
              fontWeight: isOverBudget ? 'bold' : '600',
            }
          ]}>
            {slotName}
          </Text>
          {isOverBudget && (
            <WarningIcon
              width={25}
              height={25}
              fill="#CC0000" // 빨간색 적용
              style={{ marginLeft: Spacing.sm }}
            />
          )}
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation();
              onMenuPress?.();
            }}
          >
            <View style={styles.menuDots}>
              <View style={[styles.dot, { backgroundColor: theme.colors.text.secondary }]} />
              <View style={[styles.dot, { backgroundColor: theme.colors.text.secondary }]} />
              <View style={[styles.dot, { backgroundColor: theme.colors.text.secondary }]} />
            </View>
          </TouchableOpacity>

          {isTooltipOpen && (
            <View style={styles.tooltipWrapper}>
              <ActionTooltip
                onEdit={() => {
                  onEdit?.();
                  
                }}
                onHistory={() => {
                  onHistory?.();
                  console.log("History Clicked");
                }}
              />
            </View>
          )}
        </View>
      </View>

      {/* 카드 하단: 원형 progress bar와 예산 정보 */}
      <View style={styles.cardContent}>
        {/* 왼쪽: 원형 progress bar */}
        <View style={[
          styles.progressContainer,
          isOverBudget && {
            shadowColor: '#FF4444',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }
        ]}>
          <CircularProgress
            progress={isOverBudget ? 1.0 : progress}
            size={70}
            strokeWidth={isOverBudget ? 8 : 7}
            color={isOverBudget ? '#FF4444' : slotColor}
            backgroundColor={theme.colors.background.tertiary}
            icon={slotIcon}
            iconSize={20}
            iconColor={isOverBudget ? '#FF4444' : slotColor}
          />
        </View>

        {/* 오른쪽: 예산 정보 (이전 버전) */}
        <View style={styles.budgetInfo}>
          <View style={styles.amountContainer}>
            <Text style={[styles.remain, { color: isOverBudget ? '#FF4444' : theme.colors.text.primary }]}>{(remainingBudget ?? 0).toLocaleString()}원</Text>
            <Text style={[styles.budget, { color: theme.colors.text.secondary }]}>/ {(currentBudget ?? 0).toLocaleString()}원</Text>
          </View>
        </View>
      </View>
    </View >
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
  nameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
  },
  tooltipWrapper: {
    position: 'absolute',
    top: 0,
    right: 20, // 메뉴 버튼에 더 가까이 위치
    zIndex: 1000,
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

