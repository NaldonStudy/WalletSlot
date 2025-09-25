/*
 * 📋 알림 화면 - 리팩토링된 컴포넌트 구조
 */

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
// @ts-ignore - react-native-gesture-handler Swipeable은 deprecated 마킹되었지만 여전히 안정적으로 동작함
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LoadingIndicator } from '@/src/components';
import { NotificationFilters } from '@/src/components/NotificationFilters';
import { NotificationRow } from '@/src/components/NotificationItem';
import { themes } from '@/src/constants/theme';
import { usePushNotificationSystem } from '@/src/hooks';
import { useNotificationLogic } from '@/src/hooks/useNotificationLogic';
import { useNotificationNavigation } from '@/src/hooks/useNotificationNavigation';
import { logPerformance, monitoringService } from '@/src/services';
import type { NotificationItem } from '@/src/types';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  // 화면 로드 시간 측정 시작
  const screenLoadStart = useRef(Date.now());

  // 푸시 시스템 훅 (배지 초기화 등 내부에서만 사용)
  const { isInitialized, unifiedPushService } = usePushNotificationSystem();

  // 커스텀 훅으로 분리된 알림 로직
  const {
    notifications,
    isNotificationsLoading,
    refreshing,
    unreadCount,
    unreadBadgeLabel,
    totalNotificationsCount,
    selectedFilter,
    selectedTypeFilter,
    selectedDateRange,
    isFilterExpanded,
  isLoadingMore,
  hasNextPage,
  hasMore,
    filteredNotifications,
    paginatedNotifications,
    notificationTypes,
    setSelectedFilter,
    setSelectedTypeFilter,
    setSelectedDateRange,
    setIsFilterExpanded,
    onRefresh,
    loadMore,
    showAll,
    markAsRead,
    handleMarkAllAsRead,
  } = useNotificationLogic();

  // 네비게이션 훅
  const { handleNotificationPress, navigateToSettings } = useNotificationNavigation();

  // Swipeable refs map to control open/close programmatically
  const swipeableRefs = useRef(new Map<string, Swipeable>());

  // 화면 포커스 시 배지 초기화
  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        // ✅ CHANGED: 올바른 서비스 객체의 메서드를 호출하도록 수정
        unifiedPushService.setBadgeCount(0);
      }
    }, [isInitialized, unifiedPushService]) // ✅ CHANGED: 의존성 배열도 업데이트
  );

  // 화면 로드 완료 시 성능 메트릭 기록
  useEffect(() => {
    if (notifications.length > 0) {
      const loadTime = Date.now() - screenLoadStart.current;
      logPerformance('notifications_screen_load', loadTime, 'ms');

      monitoringService.logUserInteraction('navigation', {
        screen: 'notifications',
        loadTime,
        notificationsCount: notifications.length,
        unreadCount,
      });
    }
  }, [notifications.length, unreadCount]);

  // 스크롤 끝에 도달했을 때 처리
  const handleEndReached = useCallback(() => {
    loadMore();
  }, [loadMore]);

  // 성능 최적화를 위한 getItemLayout
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 120,
    offset: 120 * index,
    index,
  }), []);

  // 알림 클릭 시 읽음 처리
  const handleItemPress = useCallback(
    (item: NotificationItem) => {
      const markAsReadIfNeeded = (noti: NotificationItem) => {
        if (!noti.isRead) {
          markAsRead(noti.id);
        }
      };
      handleNotificationPress(item, markAsReadIfNeeded);
    },
    [handleNotificationPress, markAsRead]
  );

  // 알림 아이템 렌더링
  const renderNotificationItem = useCallback(
    ({ item }: { item: NotificationItem }) => {
      const currentItem = notifications.find(n => n.id === item.id) || item;
      return (
        <NotificationRow
          item={currentItem}
          theme={theme}
          swipeableRefs={swipeableRefs}
          onMarkAsRead={markAsRead}
          onPress={handleItemPress}
        />
      );
    },
    [notifications, theme, markAsRead, handleItemPress]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
    >
      {/* 헤더 */}
      <ThemedView
        style={[styles.header, { borderBottomColor: theme.colors.border.light }]}
      >
        <ThemedView style={styles.headerContent}>
          <ThemedText type="title">
            알림 {unreadCount > 0 && `(${unreadBadgeLabel})`}
          </ThemedText>
          <ThemedView style={styles.headerActions}>


            {/* 프로덕션에서는 설정 진입을 상단 톱니로 노출하지 않음 (요구사항에 따라 제거) */}

            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
                <ThemedText style={[styles.markAllText, { color: theme.colors.primary[600] }]}>
                  모두 읽음
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        </ThemedView>

  {/* 필터 컴포넌트 */}
        <NotificationFilters
          theme={theme}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          selectedTypeFilter={selectedTypeFilter}
          onTypeFilterChange={setSelectedTypeFilter}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={setSelectedDateRange}
          isFilterExpanded={isFilterExpanded}
          onToggleFilterExpanded={() => setIsFilterExpanded(!isFilterExpanded)}
          notificationsCount={totalNotificationsCount}
          unreadCount={unreadCount}
          notificationTypes={notificationTypes}
          filteredCount={filteredNotifications.length}
        />
        {/* 개발/디버그 전용 섹션 제거: 프로덕션/실서비스에서는 노출하지 않음 */}

        {notifications.length > 0 && (
          <ThemedText style={[styles.statusText, { color: theme.colors.text.tertiary, marginBottom: 8 }]}>
            💡 오른쪽으로 스와이프하여 읽음으로 표시할 수 있습니다
          </ThemedText>
        )}
      </ThemedView>

      {/* 알림 목록 */}
      {isNotificationsLoading ? (
        <LoadingIndicator fullScreen />
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={paginatedNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          getItemLayout={getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews
          contentContainerStyle={[styles.listContainer]}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary[500]}
              colors={[theme.colors.primary[500]]}
            />
          }
          ListEmptyComponent={
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                {filteredNotifications.length === 0 && notifications.length > 0
                  ? '🔍 필터 조건에 맞는 알림이 없습니다'
                  : '📭 아직 받은 알림이 없습니다'}
              </ThemedText>
            </ThemedView>
          }
          ListFooterComponent={() => null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    // settingsButton: removed (prod)
    // settingsButtonText: removed (prod)
    markAllButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    markAllText: {
      fontSize: 14,
      fontWeight: '600',
    },
    statusText: {
      fontSize: 12,
      opacity: 0.7,
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      backgroundColor: 'transparent',
    },
    emptyText: {
      fontSize: 16,
      textAlign: 'center',
    },
    // footer-related styles removed (infinite scroll only)
    loadMoreText: {
      fontSize: 14,
      fontWeight: '600',
    },
    // debug/info sections removed for production
  });