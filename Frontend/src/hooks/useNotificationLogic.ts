/*
 * 🔔 알림 로직 훅 - 알림 관련 비즈니스 로직 관리
 * 
 * 주요 기능:
 * - 알림 데이터 관리 (서버 데이터 + Mock 데이터)
 * - 필터링 로직 (상태별, 타입별, 기간별)
 * - 페이지네이션 및 무한 스크롤
 * - 읽음 상태 토글 및 모든 알림 읽음 처리
 * - 새로고침 및 로딩 상태 관리
 * 
 * 데이터 우선순위:
 * 1. 서버 데이터 (BACKEND_AVAILABLE일 때)
 * 2. Mock 데이터 (개발/테스트용)
 * 
 * 성능 최적화:
 * - useMemo로 필터링된 데이터 캐싱
 * - useCallback으로 함수 메모이제이션
 * - InteractionManager로 부드러운 UI 상호작용
 * 
 * 모니터링:
 * - 사용자 액션 로깅 (스와이프, 클릭 등)
 * - 알림 이벤트 추적
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { monitoringService } from '@/src/services';
import type { NotificationItem } from '@/src/types';
import { useDeleteNotification, useMarkAllNotificationsAsRead, useMarkNotificationAsRead, useMarkNotificationAsUnread, useNotifications } from './useNotifications';

/**
 * @hook useNotificationLogic
 * @description 알림 화면에서 필요한 파생 상태와 사용자 액션 로직을 제공합니다.
 * React Query 캐시를 단일 소스로 사용하며, 별도의 중복 로컬 상태(알림 목록/미읽음 개수)를 보관하지 않습니다.
 * 읽음/안읽음 토글은 optimistic mutation 훅에서 이미 처리하므로 여기서는 UI 중심 로직만 유지합니다.
 */

export const useNotificationLogic = () => {
  const { data: notificationsResponse, isLoading: isNotificationsLoading, refetch } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAsUnreadMutation = useMarkNotificationAsUnread();
  const deleteNotificationMutation = useDeleteNotification();
  const markAllMutation = useMarkAllNotificationsAsRead();

  // 서버/캐시 데이터 (없으면 빈 배열)
  // notificationsResponse.data는 배열이거나 { content, page } 형태일 수 있으므로 안전하게 처리
  const notifications: NotificationItem[] = Array.isArray(notificationsResponse?.data)
    ? notificationsResponse!.data
    : (notificationsResponse?.data?.content ?? []);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 로컬 UI 상태
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const ITEMS_PER_PAGE = 20;

  // 새로고침
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    try {
      await refetch?.();
    } catch (error) {
      console.error('새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // 무한 스크롤
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasNextPage) return;
    
    setIsLoadingMore(true);
    try {
      setCurrentPage(prev => prev + 1);
    } catch (error) {
      console.error('더 많은 알림 로드 실패:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasNextPage]);

  // 알림 타입 목록
  const notificationTypes = useMemo(() => [...new Set(notifications.map(n => n.type))], [notifications]);

  // 날짜 필터링
  const filterByDateRange = useCallback((item: NotificationItem) => {
    if (selectedDateRange === 'all') return true;
    
    const itemDate = new Date(item.createdAt);
    const now = new Date();
    
    switch (selectedDateRange) {
      case 'today':
        return itemDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= monthAgo;
      default:
        return true;
    }
  }, [selectedDateRange]);

  // 필터링된 알림 목록
  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      let passesReadFilter = true;
      if (selectedFilter === 'unread') passesReadFilter = !item.isRead;
      if (selectedFilter === 'read') passesReadFilter = item.isRead;
      
      const passesTypeFilter = selectedTypeFilter === 'all' || item.type === selectedTypeFilter;
      const passesDateFilter = filterByDateRange(item);
      
      return passesReadFilter && passesTypeFilter && passesDateFilter;
    });
  }, [notifications, selectedFilter, selectedTypeFilter, filterByDateRange]);

  // 페이지네이션된 알림 목록
  const paginatedNotifications = useMemo(() => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    return filteredNotifications.slice(0, endIndex);
  }, [filteredNotifications, currentPage]);

  // hasNextPage 계산 (렌더 사이드 이펙트 분리)
  useEffect(() => {
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const next = endIndex < filteredNotifications.length;
    if (hasNextPage !== next) setHasNextPage(next);
  }, [filteredNotifications, currentPage, hasNextPage]);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, selectedTypeFilter, selectedDateRange]);

  // 읽음 상태 토글
  const toggleReadStatus = useCallback((id: string, newStatus: boolean) => {
    const target = notifications.find(n => n.id === id);
    if (target) {
      monitoringService.logUserInteraction('swipe', {
        component: 'notification_item',
        notificationId: id,
        action: newStatus ? 'mark_as_read' : 'mark_as_unread',
        notificationType: target.type,
        previousState: target.isRead
      });
      monitoringService.logNotificationEvent('action_taken', {
        notificationId: id,
        type: target.type,
        action: newStatus ? 'swipe_mark_read' : 'swipe_mark_unread'
      });
    }

    // Optimistic update는 mutation 훅에서 처리; 여기서는 호출만
    if (newStatus) {
      markAsReadMutation.mutate(id, {
        onError: () => {
          Alert.alert('오류', '알림 읽음 처리 실패. 다시 시도해 주세요.');
          refetch?.();
        }
      });
    } else {
      markAsUnreadMutation.mutate(id, {
        onError: () => {
          Alert.alert('오류', '알림 안읽음 처리 실패. 다시 시도해 주세요.');
          refetch?.();
        }
      });
    }
  }, [notifications, markAsReadMutation, markAsUnreadMutation, refetch]);

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = useCallback(() => {
    Alert.alert(
      '모든 알림 읽음 처리',
      '모든 알림을 읽음으로 표시하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: () => {
            markAllMutation.mutate();
          }
        }
      ]
    );
  }, [markAllMutation]);

  return {
    // 상태
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
    
    // 액션
    setSelectedFilter,
    setSelectedTypeFilter,
    setSelectedDateRange,
    setIsFilterExpanded,
    onRefresh,
    loadMore,
    toggleReadStatus,
    handleMarkAllAsRead,
  };
};