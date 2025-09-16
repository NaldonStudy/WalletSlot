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
import { Alert, InteractionManager } from 'react-native';

import { BACKEND_AVAILABLE } from '@/src/constants/api';
import { monitoringService } from '@/src/services';
import type { NotificationItem } from '@/src/types';
import { useDeleteNotification, useMarkNotificationAsRead, useNotifications } from './useNotifications';

export const useNotificationLogic = () => {
  // API 훅
  const { data: notificationsResponse, isLoading: isNotificationsLoading, refetch } = useNotifications();
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // 로컬 상태
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  const ITEMS_PER_PAGE = 20;

  // Mock 데이터 생성 함수
  const generateMockNotifications = useCallback((): NotificationItem[] => {
    const mockData = [
      { type: 'budget_exceeded' as const, title: '예산 초과 알림', message: '생활비 슬롯이 이달 예산을 50,000원 초과했습니다. 지출을 검토해보세요.' },
      { type: 'goal_achieved' as const, title: '목표 달성!', message: '여행 적금 슬롯이 목표 금액에 도달했습니다! 축하합니다 🎉' },
      { type: 'spending_pattern' as const, title: '지출 패턴 분석', message: '이번 주 카페 지출이 평소보다 30% 증가했습니다. 확인해보세요.' },
      { type: 'account_sync' as const, title: '계좌 동기화 완료', message: '국민은행 계좌 정보가 성공적으로 업데이트되었습니다.' },
      { type: 'system' as const, title: '시스템 업데이트', message: '새로운 기능이 추가되었습니다. 업데이트 내용을 확인해보세요.' },
    ];

    return Array.from({ length: 12 }, (_, i) => {
      const template = mockData[i % mockData.length];
      return {
        id: `notif_${i}`,
        title: template.title,
        message: template.message,
        type: template.type,
        isRead: i > 4,
        createdAt: new Date(Date.now() - i * 3600000 - Math.random() * 1800000).toISOString(),
        slotId: template.type.includes('budget') || template.type.includes('goal') ? 
          Math.floor(Math.random() * 10) + 1 : undefined,
        accountId: template.type === 'account_sync' ? 
          Math.floor(Math.random() * 5) + 1 : undefined,
        pushData: {
          action: 'open_detail',
          targetScreen: template.type.includes('budget') || template.type.includes('goal') ? 
            '/dashboard' : '/notifications',
          params: { notificationId: `notif_${i}` }
        }
      };
    });
  }, []);

  // 서버 데이터 처리
  useEffect(() => {
    if (notificationsResponse?.data && notificationsResponse.data.length > 0) {
      setNotifications(notificationsResponse.data);
      setUnreadCount(notificationsResponse.data.filter(n => !n.isRead).length);
    } else {
      const mockData = generateMockNotifications();
      setNotifications(mockData);
      setUnreadCount(mockData.filter(n => !n.isRead).length);
    }
  }, [notificationsResponse, generateMockNotifications]);

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
  const notificationTypes = useMemo(() => {
    const types = [...new Set(notifications.map(n => n.type))];
    return types;
  }, [notifications]);

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
    const paginated = filteredNotifications.slice(0, endIndex);
    setHasNextPage(endIndex < filteredNotifications.length);
    return paginated;
  }, [filteredNotifications, currentPage, ITEMS_PER_PAGE]);

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, selectedTypeFilter, selectedDateRange]);

  // 읽음 상태 토글
  const toggleReadStatus = useCallback((id: string, newStatus: boolean) => {
    const item = notifications.find(n => n.id === id);
    
    if (item) {
      monitoringService.logUserInteraction('swipe', {
        component: 'notification_item',
        notificationId: id,
        action: newStatus ? 'mark_as_read' : 'mark_as_unread',
        notificationType: item.type,
        previousState: item.isRead
      });
      
      monitoringService.logNotificationEvent('action_taken', {
        notificationId: id,
        type: item.type,
        action: newStatus ? 'swipe_mark_read' : 'swipe_mark_unread'
      });
    }
    
    // 상태 업데이트는 InteractionManager 후에 실행하여
    // 스와이프/레이아웃 애니메이션이 끝난 뒤 UI 변경이 이루어지게 함
    InteractionManager.runAfterInteractions(() => {
      setNotifications(prevNotifications => {
        const updated = prevNotifications.map(n => n.id === id ? { ...n, isRead: newStatus } : n);
        const newUnreadCount = updated.filter(n => !n.isRead).length;
        setUnreadCount(newUnreadCount);
        return updated;
      });
    });

    if (BACKEND_AVAILABLE) {
      try {
        markAsReadMutation.mutate(id, {
          onError: (error) => {
            refetch?.();
            Alert.alert('오류', '알림 상태 업데이트에 실패했습니다. 다시 시도하시겠습니까?', [
              { text: '아니오', style: 'cancel' },
              { text: '예', onPress: () => toggleReadStatus(id, newStatus) }
            ]);
          },
          onSettled: () => {
            refetch?.();
          }
        });
      } catch (e) {
        refetch?.();
        Alert.alert('오류', '알림 상태 업데이트 중 문제가 발생했습니다.');
      }
    }
  }, [notifications, markAsReadMutation, refetch]);

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
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            
            if (BACKEND_AVAILABLE) {
              // TODO: useMarkAllNotificationsAsRead 뮤테이션 도입 시 처리
            }
          }
        }
      ]
    );
  }, []);

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