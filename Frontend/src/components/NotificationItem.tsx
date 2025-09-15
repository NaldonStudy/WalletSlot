/*
 * 📬 알림 아이템 컴포넌트 - 개별 알림 표시 및 스와이프 액션
 * 
 * 주요 기능:
 * - 알림 내용 표시 (제목, 메시지, 시간, 읽음/안읽음 상태)
 * - 좌우 스와이프로 읽음/안읽음 상태 변경
 * - 테마 적용 및 접근성 지원
 * - 애니메이션 제거로 깔끔한 UI 제공
 * 
 * 스와이프 액션:
 * - 왼쪽 스와이프: 읽음 → 안읽음 변경 (파란색)
 * - 오른쪽 스와이프: 안읽음 → 읽음 변경 (초록색)
 * 
 * 성능 최적화:
 * - React.memo로 불필요한 리렌더링 방지
 * - InteractionManager로 스와이프 애니메이션 후 상태 업데이트
 */

import React, { memo } from 'react';
import { InteractionManager, Pressable, StyleSheet, View } from 'react-native';
// @ts-ignore - react-native-gesture-handler Swipeable은 deprecated 마킹되었지만 여전히 안정적으로 동작함
import { Swipeable } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import type { NotificationItem } from '@/src/types';

interface NotificationRowProps {
  item: NotificationItem;
  theme: any;
  swipeableRefs: { current: Map<string, Swipeable> };
  onToggleReadStatus: (id: string, newStatus: boolean) => void;
  onPress: (item: NotificationItem) => void;
}

export const NotificationRow = memo<NotificationRowProps>(({ 
  item, 
  theme, 
  swipeableRefs, 
  onToggleReadStatus, 
  onPress 
}) => {
  // 스와이프 액션 렌더링 (왼쪽: 안읽음으로 변경)
  const renderLeftActions = (_progress?: any, _dragX?: any) => {
    if (!item.isRead) return null; // 이미 안읽음인 경우 액션 없음

    return (
      <View 
        style={[styles.swipeActionButton, { backgroundColor: '#3B82F6' }]}
      >
        <ThemedText style={[styles.swipeActionText, { fontSize: 18, marginBottom: 2 }]}>📧</ThemedText>
        <ThemedText style={[styles.swipeActionText, { fontSize: 11, fontWeight: '700' }]}>안읽음</ThemedText>
        <ThemedText style={[styles.swipeActionText, { fontSize: 10, opacity: 0.8, marginTop: 2 }]}>스와이프 완료</ThemedText>
      </View>
    );
  };

  // 스와이프 액션 렌더링 (오른쪽: 읽음으로 변경)
  const renderRightActions = (_progress?: any, _dragX?: any) => {
    if (item.isRead) return null; // 이미 읽음인 경우 액션 없음

    return (
      <View 
        style={[styles.swipeActionButton, { backgroundColor: '#10B981' }]}
      >
        <ThemedText style={[styles.swipeActionText, { fontSize: 18, marginBottom: 2 }]}>✅</ThemedText>
        <ThemedText style={[styles.swipeActionText, { fontSize: 11, fontWeight: '700' }]}>읽음</ThemedText>
        <ThemedText style={[styles.swipeActionText, { fontSize: 10, opacity: 0.8, marginTop: 2 }]}>스와이프 완료</ThemedText>
      </View>
    );
  };

  return (
      <Swipeable
      ref={(ref: Swipeable | null) => {
        if (ref && swipeableRefs.current) {
          swipeableRefs.current.set(item.id, ref);
        } else if (swipeableRefs.current) {
          swipeableRefs.current.delete(item.id);
        }
      }}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      onSwipeableLeftOpen={() => {
        const ref = swipeableRefs.current.get(item.id);
        try { ref?.close(); } catch (e) { /* ignore */ }
        if (item.isRead) {
          InteractionManager.runAfterInteractions(() => onToggleReadStatus(item.id, false));
        }
      }}
      onSwipeableRightOpen={() => {
        const ref = swipeableRefs.current.get(item.id);
        try { ref?.close(); } catch (e) { /* ignore */ }
        if (!item.isRead) {
          InteractionManager.runAfterInteractions(() => onToggleReadStatus(item.id, true));
        }
      }}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
      leftThreshold={80}
      rightThreshold={80}
    >
      <View>
        <View style={[styles.notificationItem, { 
          backgroundColor: item.isRead ? theme.colors.background.secondary : theme.colors.background.primary,
          borderColor: item.isRead ? theme.colors.border.light : theme.colors.primary[200],
        }]}
        >
          <Pressable
            onPress={() => onPress(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title} 알림. ${item.isRead ? '읽음' : '읽지 않음'}. 좌우로 스와이프하여 상태 변경 가능`}
          >
          <ThemedView style={styles.notificationContent}>
            <ThemedView style={styles.notificationHeader}>
              <ThemedText style={[
                styles.title, 
                { 
                  color: theme.colors.text.primary,
                  fontWeight: item.isRead ? '500' : '600'
                }
              ]}>
                {item.title}
              </ThemedText>
              {!item.isRead && (
                <View style={[
                  styles.unreadDot, 
                  { backgroundColor: theme.colors.primary[500] }
                ]} />
              )}
            </ThemedView>
            
            <ThemedText style={[
              styles.message, 
              { 
                color: theme.colors.text.secondary,
                opacity: item.isRead ? 0.7 : 1
              }
            ]}>
              {item.message}
            </ThemedText>
            
            <ThemedText style={[
              styles.timestamp, 
              { color: theme.colors.text.tertiary }
            ]}>
              {new Date(item.createdAt).toLocaleString('ko-KR', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </ThemedText>
          </ThemedView>
          </Pressable>
        </View>
      </View>
    </Swipeable>
  );
});

const styles = StyleSheet.create({
  notificationItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationContent: {
    backgroundColor: 'transparent',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  swipeActionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: '100%',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  swipeActionText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
});

NotificationRow.displayName = 'NotificationRow';