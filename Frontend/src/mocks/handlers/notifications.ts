/*
 * 🔔 알림 API Mock 핸들러
 * 
 * MSW를 사용하여 알림 관련 API를 모킹합니다.
 * 실제 서버 API와 동일한 구조로 응답을 제공합니다.
 */

import type { NotificationItem, NotificationSettings } from '@/src/types';
import { http, HttpResponse } from 'msw';

// Mock 알림 데이터 생성 함수
const generateMockNotifications = (): NotificationItem[] => {
  const mockTemplates = [
    { 
      type: 'budget_exceeded' as const, 
      title: '예산 초과 알림', 
      message: '생활비 슬롯이 이달 예산을 50,000원 초과했습니다. 지출을 검토해보세요.',
      slotId: 'slot_001'
    },
    { 
      type: 'goal_achieved' as const, 
      title: '목표 달성!', 
      message: '여행 적금 슬롯이 목표 금액에 도달했습니다! 축하합니다 🎉',
      slotId: 'slot_002'
    },
    { 
      type: 'spending_pattern' as const, 
      title: '지출 패턴 분석', 
      message: '이번 주 카페 지출이 평소보다 30% 증가했습니다. 확인해보세요.' 
    },
    { 
      type: 'account_sync' as const, 
      title: '계좌 동기화 완료', 
      message: '국민은행 계좌 정보가 성공적으로 업데이트되었습니다.',
      accountId: 'account_001'
    },
    { 
      type: 'system' as const, 
      title: '시스템 업데이트', 
      message: '새로운 기능이 추가되었습니다. 업데이트 내용을 확인해보세요.' 
    },
    {
      type: 'budget_exceeded' as const,
      title: '쇼핑 예산 초과',
      message: '쇼핑 슬롯이 주간 예산을 25,000원 초과했습니다.',
      slotId: 'slot_003'
    },
    {
      type: 'goal_achieved' as const,
      title: '비상금 목표 달성',
      message: '비상금 슬롯이 200만원 목표를 달성했습니다! 🎊',
      slotId: 'slot_004'
    },
    {
      type: 'spending_pattern' as const,
      title: '교통비 패턴 변화',
      message: '이번 달 교통비가 지난 달 대비 15% 절약되었습니다.'
    }
  ];

  return Array.from({ length: 15 }, (_, i) => {
    const template = mockTemplates[i % mockTemplates.length];
    const baseDate = new Date();
    const daysAgo = Math.floor(Math.random() * 30); // 0-30일 전 랜덤
    const createdAt = new Date(baseDate.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    return {
      id: `notification_${i + 1}`,
      title: template.title,
      message: template.message,
      type: template.type,
      isRead: Math.random() > 0.6, // 40% 확률로 읽지 않음
      createdAt: createdAt.toISOString(),
      slotId: template.slotId ? parseInt(template.slotId.replace('slot_', '')) : undefined,
      accountId: template.accountId ? parseInt(template.accountId.replace('account_', '')) : undefined,
      pushData: {
        targetScreen: template.type === 'budget_exceeded' || template.type === 'goal_achieved' 
          ? '/(tabs)/dashboard' 
          : template.type === 'account_sync' 
          ? '/(tabs)/profile' 
          : '/(tabs)/notifications'
      }
    };
  });
};

// 메모리에 저장될 Mock 데이터
let mockNotifications = generateMockNotifications();

// 안전 장치: 빈 배열일 경우 재생성하고 로그를 남깁니다.
if (!mockNotifications || mockNotifications.length === 0) {
  console.log('[MSW] mockNotifications was empty; regenerating default notifications');
  mockNotifications = generateMockNotifications();
}

// Mock 알림 설정
const mockNotificationSettings: NotificationSettings = {
  pushEnabled: true,
  budgetAlertsEnabled: true,
  goalAlertsEnabled: true,
  spendingPatternEnabled: true,
  systemAlertsEnabled: true,
};

export const notificationHandlers = [
  // 알림 조회 (GET /api/notifications) - 상대 경로만 유지 (절대 경로 중복 제거)
  http.get('/api/notifications', ({ request }) => {
    console.log('[MSW] GET /api/notifications called with', request.url);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const type = url.searchParams.get('type');

    // 필터링
    let filteredNotifications = [...mockNotifications];
    
    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.isRead);
    }
    
    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredNotifications.slice(startIndex, endIndex);

    // 응답 데이터
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(filteredNotifications.length / limit),
      totalItems: filteredNotifications.length,
      hasNextPage: endIndex < filteredNotifications.length,
      hasPreviousPage: page > 1
    };
    console.log(`[MSW] Returning ${paginatedData.length} notifications (total filtered: ${filteredNotifications.length})`);
    return HttpResponse.json({
      success: true,
      message: '알림 목록 조회 성공',
      data: paginatedData,
      pagination,
      meta: {
        page,
        limit,
        total: pagination.totalItems,
        hasNext: pagination.hasNextPage
      }
    });
  }),

  // 읽지 않은 알림 개수 조회
  http.get('/api/notifications/unread-count', () => {
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    console.log('[MSW] GET /api/notifications/unread-count ->', unreadCount);
    return HttpResponse.json({ count: unreadCount });
  }),

  // 알림 읽음 처리 (PATCH /api/notifications/{notificationId}/read)
  http.patch('/api/notifications/:notificationId/read', async ({ params, request }) => {
    const { notificationId } = params;
    const body = await request.json() as { isRead: boolean; readAt?: string };
    const notification = mockNotifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return HttpResponse.json(
        { error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    notification.isRead = body.isRead;
    if (body.isRead && body.readAt) {
      // readAt 필드가 있다면 추가 (타입에 따라)
      (notification as any).readAt = body.readAt;
    }
    
    return HttpResponse.json({
      success: true,
      data: notification
    });
  }),

  // 내 알림 전체 읽음 처리 (POST /api/notifications/read-all)
  http.post('/api/notifications/read-all', () => {
    mockNotifications.forEach(notification => {
      notification.isRead = true;
    });
    
    return HttpResponse.json({
      success: true,
      message: '모든 알림이 읽음으로 표시되었습니다.'
    });
  }),

  // 알림 삭제 (DELETE /api/notifications/{notificationId})
  http.delete('/api/notifications/:notificationId', ({ params }) => {
    const { notificationId } = params;
    const index = mockNotifications.findIndex(n => n.id === notificationId);
    
    if (index === -1) {
      return HttpResponse.json(
        { error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    mockNotifications.splice(index, 1);
    
    return HttpResponse.json({
      success: true,
      message: '알림이 삭제되었습니다.'
    });
  }),

  // 알림 설정 조회
  http.get('/api/notifications/settings', () => {
    return HttpResponse.json({
      data: mockNotificationSettings
    });
  }),

  // 알림 설정 업데이트
  http.put('/api/notifications/settings', async ({ request }) => {
    const updates = await request.json() as Partial<NotificationSettings>;
    
    Object.assign(mockNotificationSettings, updates);
    
    return HttpResponse.json({
      success: true,
      data: mockNotificationSettings
    });
  }),

  // 특정 사용자에게 알림 생성 (POST /api/notifications)
  http.post('/api/notifications', async ({ request }) => {
    const notificationData = await request.json() as any;
    
    // 새 알림 생성
    const newNotification: NotificationItem = {
      id: `notification_${Date.now()}`,
      title: notificationData.title || '새 알림',
      message: notificationData.message || '알림 메시지',
      type: notificationData.type || 'system',
      isRead: false,
      createdAt: new Date().toISOString(),
      slotId: notificationData.slotId,
      accountId: notificationData.accountId,
      pushData: notificationData.pushData || {
        targetScreen: '/(tabs)/notifications'
      }
    };
    
    // Mock 데이터에 추가
    mockNotifications.unshift(newNotification);
    
    return HttpResponse.json({
      success: true,
      data: newNotification,
      message: '알림이 생성되었습니다.'
    });
  }),

  // 앱 접속 시 "미접속 알림" 일괄 조회 후 전송 처리 (POST /api/notifications/pull)
  http.post('/api/notifications/pull', () => {
    // 미접속 알림들을 반환 (실제로는 서버에서 관리)
    const undeliveredNotifications = mockNotifications.filter(n => !n.isRead);
    
    return HttpResponse.json({
      success: true,
      data: undeliveredNotifications,
      message: '미접속 알림을 성공적으로 조회했습니다.'
    });
  }),

  // 알림 하나 전송 처리 (PATCH /api/notifications/{notificationId}/delivered)
  http.patch('/api/notifications/:notificationId/delivered', ({ params }) => {
    const { notificationId } = params;
    const notification = mockNotifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return HttpResponse.json(
        { error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 전송 처리 로직 (실제로는 delivered 상태 업데이트)
    (notification as any).delivered = true;
    (notification as any).deliveredAt = new Date().toISOString();
    
    return HttpResponse.json({
      success: true,
      data: notification
    });
  }),

  // 알림 상태 토글 (읽음/안읽음) - 기존 기능 유지
  http.patch('/api/notifications/:id/toggle-read', ({ params }) => {
    const { id } = params;
    const notification = mockNotifications.find(n => n.id === id);
    
    if (!notification) {
      return HttpResponse.json(
        { error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    notification.isRead = !notification.isRead;
    
    return HttpResponse.json({
      success: true,
      data: notification
    });
  }),
  
];