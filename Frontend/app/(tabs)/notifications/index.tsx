/*
 * 📋 알림 화면 - 리팩토링된 컴포넌트 구조
 * 
 * 주요 기능:
 * - 알림 목록 표시 및 필터링
 * - 스와이프 읽음/안읽음 상태 변경
 * - 무한 스크롤 및 새로고침
 * - 알림 클릭 시 네비게이션
 * 
 * 컴포넌트 분리:
 * - NotificationRow: 개별 알림 아이템 (src/components/NotificationItem.tsx)
 * - NotificationFilters: 필터 UI (src/components/NotificationFilters.tsx)
 * - useNotificationLogic: 비즈니스 로직 훅 (src/hooks/useNotificationLogic.ts)
 * - useNotificationNavigation: 네비게이션 로직 훅 (src/hooks/useNotificationNavigation.ts)
 */

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
// @ts-ignore - react-native-gesture-handler Swipeable은 deprecated 마킹되었지만 여전히 안정적으로 동작함
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
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
  
  // 푸시 알림 시스템 훅
  const { 
    isInitialized, 
    notificationService 
  } = usePushNotificationSystem();

  // 커스텀 훅으로 분리된 알림 로직
  const {
    notifications,
    isNotificationsLoading,
    refreshing,
    unreadCount,
    selectedFilter,
    selectedTypeFilter,
    selectedDateRange,
    isFilterExpanded,
    isLoadingMore,
    hasNextPage,
    filteredNotifications,
    paginatedNotifications,
    notificationTypes,
    setSelectedFilter,
    setSelectedTypeFilter,
    setSelectedDateRange,
    setIsFilterExpanded,
    onRefresh,
    loadMore,
    toggleReadStatus,
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
        notificationService.setBadgeCount(0);
      }
    }, [isInitialized, notificationService])
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
  const handleItemPress = useCallback((item: NotificationItem) => {
    const markAsRead = (item: NotificationItem) => {
      if (!item.isRead) {
        toggleReadStatus(item.id, true);
      }
    };
    
    handleNotificationPress(item, markAsRead);
  }, [handleNotificationPress, toggleReadStatus]);

  // 알림 아이템 렌더링
  const renderNotificationItem = useCallback(({ item }: { item: NotificationItem }) => {
    // 실시간으로 최신 상태 찾기
    const currentItem = notifications.find(n => n.id === item.id) || item;

    return (
      <NotificationRow
        item={currentItem}
        theme={theme}
        swipeableRefs={swipeableRefs}
        onToggleReadStatus={toggleReadStatus}
        onPress={handleItemPress}
      />
    );
  }, [notifications, theme, toggleReadStatus, handleItemPress]);

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: theme.colors.background.primary }
    ]}>
      {/* 헤더 */}
      <ThemedView style={[
        styles.header,
        { borderBottomColor: theme.colors.border.light }
      ]}>
        <ThemedView style={styles.headerContent}>
          <ThemedText type="title">
            알림 {unreadCount > 0 && `(${unreadCount})`}
          </ThemedText>
          <ThemedView style={styles.headerActions}>
            {/* Firebase 푸시 테스트 버튼 (개발 모드에서만) */}
            {__DEV__ && (
              <TouchableOpacity 
                onPress={async () => {
                  try {
                    const { unifiedPushService } = await import('@/src/services/unifiedPushService');
                    const result = await unifiedPushService.testScenarios.budgetExceeded('생활비', 25000);
                    console.log('🚀 Firebase 푸시 테스트 결과:', result);
                    
                    // 성공/실패 피드백을 로컬 알림으로 표시
                    if (result.success) {
                      await unifiedPushService.sendLocalNotification(
                        '테스트 성공',
                        `Firebase 푸시가 ${result.method} 방식으로 전송되었습니다`
                      );
                    } else {
                      await unifiedPushService.sendLocalNotification(
                        '테스트 실패',
                        result.message
                      );
                    }
                  } catch (error) {
                    console.error('❌ Firebase 푸시 테스트 실패:', error);
                  }
                }}
                style={styles.settingsButton}
              >
                <ThemedText style={[
                  styles.settingsButtonText,
                  { color: theme.colors.primary[600] }
                ]}>
                  🚀
                </ThemedText>
              </TouchableOpacity>
            )}
            
            {/* 알림 설정 버튼 */}
            <TouchableOpacity 
              onPress={navigateToSettings}
              style={styles.settingsButton}
            >
              <ThemedText style={[
                styles.settingsButtonText,
                { color: theme.colors.primary[600] }
              ]}>
                ⚙️
              </ThemedText>
            </TouchableOpacity>
            
            {unreadCount > 0 && (
              <TouchableOpacity 
                onPress={handleMarkAllAsRead}
                style={styles.markAllButton}
              >
                <ThemedText style={[
                  styles.markAllText,
                  { color: theme.colors.primary[600] }
                ]}>
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
          notificationsCount={notifications.length}
          unreadCount={unreadCount}
          notificationTypes={notificationTypes}
          filteredCount={filteredNotifications.length}
        />
        
        {/* 사용법 안내 */}
        {notifications.length > 0 && (
          <ThemedText style={[styles.statusText, { color: theme.colors.text.tertiary, marginBottom: 8 }]}>
            💡 좌우로 스와이프하여 읽음/안읽음 상태를 변경할 수 있습니다
          </ThemedText>
        )}
      </ThemedView>
      

      
      {/* 알림 목록 */}
      {isNotificationsLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      ) : (
  <FlatList
  style={{ flex: 1 }}
        data={paginatedNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        getItemLayout={getItemLayout}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        contentContainerStyle={[
          styles.listContainer,
        ]}
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
                : '📭 아직 받은 알림이 없습니다'
              }
            </ThemedText>
          </ThemedView>
        }
        ListFooterComponent={() => (
          hasNextPage && paginatedNotifications.length > 0 ? (
            <View style={[styles.footerWrapper, { paddingBottom: 24 }]}>
              <View style={styles.loadingMore}>
                {isLoadingMore ? (
                  <ActivityIndicator 
                    size="small" 
                    color={theme.colors.primary[500]} 
                  />
                ) : (
                  <TouchableOpacity 
                    onPress={loadMore}
                    style={styles.loadMoreButton}
                  >
                    <ThemedText style={[styles.loadMoreText, { color: theme.colors.primary[600] }]}> 
                      더 보기 ({filteredNotifications.length - paginatedNotifications.length}개 더)
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : null
        )}
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
  settingsButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  settingsButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
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
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerWrapper: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
