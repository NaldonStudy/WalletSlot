import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { faker } from '@faker-js/faker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/src/components';
import { useColorScheme } from '@/hooks/useColorScheme';
import { themes } from '@/src/constants/theme';
import { 
  usePushNotificationSystem,
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead
} from '@/src/hooks';
import type { NotificationItem } from '@/src/types';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  
  // 푸시 알림 시스템 훅
  const { 
    pushToken, 
    appState, 
    isInitialized, 
    notificationService 
  } = usePushNotificationSystem();
  
  // 알림 관련 쿼리 및 뮤테이션
  const { data: notificationsResponse, isLoading, refetch } = useNotifications();
  const { data: unreadCountResponse } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  
  // 로컬 상태
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock 데이터 생성 (실제 API 연동 전까지)
  const generateMockNotifications = useCallback((): NotificationItem[] => {
    const types: NotificationItem['type'][] = [
      'budget_exceeded', 'goal_achieved', 'spending_pattern', 'system', 'account_sync'
    ];
    
    const titles = [
      '🚨 예산 초과 알림',
      '🎉 목표 달성!',
      '📊 지출 패턴 분석',
      '⚙️ 시스템 업데이트',
      '🔄 계좌 동기화 완료',
      '💰 슬롯 잔액 부족',
      '📈 월간 리포트 준비됨',
      '🎯 새로운 목표 추천',
    ];

    return Array.from({ length: 15 }, (_, i) => ({
      id: `notif_${i}`,
      title: faker.helpers.arrayElement(titles),
      message: `${faker.lorem.sentence()} 탭하여 자세한 내용을 확인하세요.`,
      type: faker.helpers.arrayElement(types),
      isRead: i > 5, // 최근 5개는 읽지 않음
      createdAt: new Date(Date.now() - i * 3600000).toISOString(), // 1시간씩 과거
      slotId: faker.datatype.boolean() ? faker.number.int({ min: 1, max: 10 }) : undefined,
      accountId: faker.datatype.boolean() ? faker.number.int({ min: 1, max: 5 }) : undefined,
      pushData: {
        action: 'open_detail',
        targetScreen: '/dashboard',
        params: { notificationId: `notif_${i}` }
      }
    }));
  }, []);

  // 컴포넌트 마운트 시 Mock 데이터 생성
  useEffect(() => {
    const mockData = generateMockNotifications();
    setNotifications(mockData);
    setUnreadCount(mockData.filter(n => !n.isRead).length);
  }, [generateMockNotifications]);

  // 화면 포커스 시 배지 초기화
  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        notificationService.setBadgeCount(0);
      }
    }, [isInitialized, notificationService])
  );

  // 새로고침
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // 실제 API 호출 시
      // await refetch();
      
      // Mock 데이터 재생성
      const newMockData = generateMockNotifications();
      setNotifications(newMockData);
      setUnreadCount(newMockData.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  }, [generateMockNotifications]);

  // 알림 클릭 처리
  const handleNotificationPress = useCallback((item: NotificationItem) => {
    if (!item.isRead) {
      // 읽음 처리 (로컬 상태 업데이트)
      setNotifications(prev => 
        prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // 서버에 읽음 처리 요청 (실제 API 연동 시)
      // markAsReadMutation.mutate(item.id);
    }
    
    // 화면 이동 로직 (실제 구현 시)
    console.log('알림 클릭:', item.title, '-> 이동할 화면:', item.pushData?.targetScreen);
  }, []);

  // 전체 읽음 처리
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
            // markAllAsReadMutation.mutate();
          }
        }
      ]
    );
  }, []);

  // 테스트 알림 전송
  const sendTestNotification = useCallback((type: 'immediate' | 'delayed' | 'budget' | 'goal' | 'sync') => {
    if (!isInitialized) {
      Alert.alert('오류', '푸시 알림이 아직 초기화되지 않았습니다.');
      return;
    }

    switch (type) {
      case 'immediate':
        notificationService.testNotifications.immediate();
        break;
      case 'delayed':
        notificationService.testNotifications.delayed(5);
        Alert.alert('알림 예약됨', '5초 후에 알림이 도착합니다.');
        break;
      case 'budget':
        notificationService.testNotifications.budgetExceeded('생활비', 50000);
        break;
      case 'goal':
        notificationService.testNotifications.goalAchieved('여행 적금');
        break;
      case 'sync':
        notificationService.testNotifications.accountSync('국민은행');
        break;
    }
  }, [isInitialized, notificationService]);

  // 알림 아이템 렌더링
  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { 
          backgroundColor: item.isRead 
            ? theme.colors.background.secondary 
            : theme.colors.primary[50],
          borderColor: item.isRead 
            ? theme.colors.border.light 
            : theme.colors.primary[200],
          borderLeftWidth: item.isRead ? 0 : 4,
          borderLeftColor: theme.colors.primary[500],
        }
      ]}
      onPress={() => handleNotificationPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} 알림. ${item.isRead ? '읽음' : '읽지 않음'}`}
    >
      <ThemedView style={styles.notificationContent}>
        <ThemedView style={styles.notificationHeader}>
          <ThemedText style={[
            styles.title, 
            { color: theme.colors.text.primary }
          ]}>
            {item.title}
          </ThemedText>
          {!item.isRead && (
            <ThemedView style={[
              styles.unreadDot, 
              { backgroundColor: theme.colors.primary[500] }
            ]} />
          )}
        </ThemedView>
        
        <ThemedText style={[
          styles.message, 
          { color: theme.colors.text.secondary }
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
    </TouchableOpacity>
  );

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
        
        {/* 시스템 상태 표시 */}
        <ThemedText style={[styles.statusText, { color: theme.colors.text.tertiary }]}>
          {Platform.OS === 'ios' ? '📱' : '🤖'} {appState} | 
          푸시: {isInitialized ? '✅' : '❌'} | 
          토큰: {pushToken ? '✅' : '❌'}
        </ThemedText>
      </ThemedView>
      
      {/* 테스트 버튼들 */}
      <ThemedView style={styles.testSection}>
        <Button 
          title="즉시 🔔" 
          onPress={() => sendTestNotification('immediate')}
          variant="primary"
          size="sm"
        />
        <Button 
          title="5초 후 ⏰" 
          onPress={() => sendTestNotification('delayed')}
          variant="outline"
          size="sm"
        />
        <Button 
          title="예산 초과 🚨" 
          onPress={() => sendTestNotification('budget')}
          variant="outline"
          size="sm"
        />
        <Button 
          title="목표 달성 🎉" 
          onPress={() => sendTestNotification('goal')}
          variant="outline"
          size="sm"
        />
        <Button 
          title="계좌 동기화 🔄" 
          onPress={() => sendTestNotification('sync')}
          variant="outline"
          size="sm"
        />
      </ThemedView>
      
      {/* 알림 목록 */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
              📭 아직 받은 알림이 없습니다
            </ThemedText>
          </ThemedView>
        }
      />
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
  testSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
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
});
