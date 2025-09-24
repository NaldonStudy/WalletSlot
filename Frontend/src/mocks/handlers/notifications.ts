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
    // BUDGET 알림들 - 예산 관련, 해당 슬롯으로 네비게이션
    { 
      type: 'BUDGET' as const, 
      title: '예산 초과 알림', 
      message: '생활비 슬롯이 이달 예산을 50,000원 초과했습니다. 지출을 검토해보세요.',
      accountId: 'account_001',
      slotId: 'slot_001'
    },
    { 
      type: 'BUDGET' as const, 
      title: '예산 80% 사용', 
      message: '쇼핑 슬롯 예산의 80%를 사용했습니다. 남은 예산을 확인해보세요.',
      accountId: 'account_001',
      slotId: 'slot_002'
    },
    {
      type: 'BUDGET' as const,
      title: '예산 설정 완료',
      message: '여행 슬롯의 새로운 예산이 설정되었습니다. (500,000원)',
      accountId: 'account_001',
      slotId: 'slot_003'
    },
    
    // TRANSACTION 알림들 - 거래 관련, 해당 거래/슬롯으로 네비게이션  
    { 
      type: 'TRANSACTION' as const, 
      title: '대용량 지출 감지', 
      message: '생활비 슬롯에서 85,000원이 사용되었습니다. (스타벅스)',
      accountId: 'account_001',
      slotId: 'slot_001',
      transactionId: 'transaction_001'
    },
    {
      type: 'TRANSACTION' as const,
      title: '지출 패턴 변화',
      message: '이번 주 교통비가 평소보다 30% 증가했습니다. 교통 슬롯을 확인해보세요.',
      accountId: 'account_001',
      slotId: 'slot_004'
    },
    {
      type: 'TRANSACTION' as const,
      title: '정기 결제 알림',
      message: '넷플릭스 구독료 16,500원이 엔터테인먼트 슬롯에서 결제되었습니다.',
      accountId: 'account_001',
      slotId: 'slot_005',
      transactionId: 'transaction_002'
    },

    // SYSTEM 알림들 - 앱/시스템 관련, 네비게이션 없음 (모달 표시)
    { 
      type: 'SYSTEM' as const, 
      title: '앱 업데이트 완료', 
      message: '새로운 기능이 추가되었습니다! 슬롯 관리 기능이 개선되었습니다.' 
    },
    {
      type: 'SYSTEM' as const,
      title: '서비스 점검 안내',
      message: '내일 오전 2시-4시 서비스 점검이 예정되어 있습니다. 이용에 참고해주세요.'
    },
    {
      type: 'SYSTEM' as const,
      title: '보안 업데이트',
      message: '보안 강화를 위한 업데이트가 적용되었습니다. 더욱 안전해진 WalletSlot을 이용해보세요.'
    },

    // DEVICE 알림들 - 기기/계좌 동기화 관련, 네비게이션 없음 (모달 표시)
    { 
      type: 'DEVICE' as const, 
      title: '계좌 동기화 완료', 
      message: '국민은행 계좌 정보가 성공적으로 업데이트되었습니다.',
      accountId: 'account_001'
    },
    {
      type: 'DEVICE' as const,
      title: '새 기기 로그인',
      message: '새로운 기기에서 로그인이 감지되었습니다. 본인이 아니라면 비밀번호를 변경해주세요.'
    },
    {
      type: 'DEVICE' as const,
      title: '푸시 알림 설정 변경',
      message: '푸시 알림이 활성화되었습니다. 중요한 알림을 놓치지 마세요!'
    },

    // MARKETING 알림들 - 이벤트/광고 관련, 네비게이션 없음 (모달 표시)
    {
      type: 'MARKETING' as const,
      title: '신규 이벤트 안내',
      message: '🎉 첫 달 예산 달성 시 스타벅스 쿠폰을 드려요! 지금 바로 참여해보세요.'
    },
    {
      type: 'MARKETING' as const,
      title: '친구 초대 이벤트',
      message: '친구를 초대하고 함께 용돈을 절약해보세요! 초대할 때마다 5,000원 적립금을 드립니다.'
    },
    {
      type: 'MARKETING' as const,
      title: '월말 리포트 발송',
      message: '이번 달 소비 리포트가 준비되었습니다. 나만의 소비 패턴을 확인해보세요! 📊'
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
      slotId: (template as any).slotId ? parseInt((template as any).slotId.replace('slot_', '')) : undefined,
      accountId: (template as any).accountId ? parseInt((template as any).accountId.replace('account_', '')) : undefined,
      transactionId: (template as any).transactionId,
      pushData: {
        targetScreen: template.type === 'BUDGET' 
          ? '/(tabs)/dashboard' 
          : template.type === 'DEVICE' 
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
  // ===== Push Endpoint Management APIs =====
  
  // 푸시 엔드포인트 등록/갱신 (POST /api/push/endpoints)
  http.post('/api/push/endpoints', async ({ request }) => {
    const data = await request.json() as any;
    console.log('[MSW] POST /api/push/endpoints:', data);
    
    const deviceId = data.deviceId || `device_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    return HttpResponse.json({
      success: true,
      message: '푸시 엔드포인트가 등록되었습니다.',
      data: {
        device: {
          deviceId,
          platform: data.platform,
          status: 'ACTIVE',
          pushEnabled: data.pushEnabled ?? true,
          tokenPresent: !!data.token
        }
      }
    });
  }),

  // 내 푸시 엔드포인트 목록 (GET /api/push/endpoints)
  http.get('/api/push/endpoints', () => {
    console.log('[MSW] GET /api/push/endpoints');
    return HttpResponse.json({
      success: true,
      message: '푸시 엔드포인트 목록 조회 성공',
      data: {
        devices: [
          {
            deviceId: 'current_device_001',
            platform: 'ANDROID',
            status: 'ACTIVE',
            pushEnabled: true,
            tokenPresent: true
          }
        ]
      }
    });
  }),

  // 푸시 엔드포인트 부분 수정 (PATCH /api/push/endpoints/{deviceId})
  http.patch('/api/push/endpoints/:deviceId', async ({ params, request }) => {
    const { deviceId } = params;
    const data = await request.json() as any;
    console.log('[MSW] PATCH /api/push/endpoints/' + deviceId, data);
    
    return HttpResponse.json({
      success: true,
      message: '푸시 엔드포인트가 수정되었습니다.',
      data: {
        device: {
          deviceId,
          platform: 'ANDROID',
          status: 'ACTIVE',
          pushEnabled: data.pushEnabled ?? true,
          tokenPresent: true
        }
      }
    });
  }),

  // 푸시 엔드포인트 삭제 (DELETE /api/push/endpoints/{deviceId})
  http.delete('/api/push/endpoints/:deviceId', ({ params }) => {
    const { deviceId } = params;
    console.log('[MSW] DELETE /api/push/endpoints/' + deviceId);
    
    return HttpResponse.json({
      success: true,
      message: '푸시 엔드포인트가 삭제되었습니다.',
      data: {
        device: {
          deviceId,
          platform: 'ANDROID',
          status: 'LOGGED_OUT',
          pushEnabled: false,
          tokenPresent: false
        }
      }
    });
  }),

  // ===== Notification Management APIs =====

  // 알림 목록 조회 (GET /api/notifications) - Swagger 명세에 맞춤
  http.get('/api/notifications', ({ request }) => {
    console.log('[MSW] GET /api/notifications called with', request.url);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0'); // 0-based
    const size = parseInt(url.searchParams.get('size') || '20');
    const type = url.searchParams.get('type');
    const sort = url.searchParams.getAll('sort');

    // 필터링
    let filteredNotifications = [...mockNotifications];
    
    if (type && type !== 'all' && ['SYSTEM', 'DEVICE', 'BUDGET', 'TRANSACTION', 'MARKETING'].includes(type)) {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }

    // 정렬 (기본: 최신순)
    filteredNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 페이지네이션 (0-based)
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedData = filteredNotifications.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredNotifications.length / size);

    console.log(`[MSW] Returning ${paginatedData.length} notifications (page ${page}, size ${size}, total filtered: ${filteredNotifications.length})`);
    
    return HttpResponse.json({
      success: true,
      message: '알림 목록 조회 성공',
      data: {
        content: paginatedData,
        page: {
          number: page,
          size: size,
          totalElements: filteredNotifications.length,
          totalPages: totalPages,
          first: page === 0,
          last: page >= totalPages - 1
        }
      }
    });
  }),

  // 미읽음 개수 조회 (GET /api/notifications/unread-count)
  http.get('/api/notifications/unread-count', () => {
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    console.log('[MSW] GET /api/notifications/unread-count ->', unreadCount);
    return HttpResponse.json({
      success: true,
      message: '미읽음 알림 개수 조회 성공',
      data: {
        count: unreadCount
      }
    });
  }),

  // 미전송 Pull + delivered 처리 (POST /api/notifications/pull)
  http.post('/api/notifications/pull', () => {
    const undeliveredNotifications = mockNotifications.filter(n => !n.isRead);
    console.log('[MSW] POST /api/notifications/pull ->', undeliveredNotifications.length, 'notifications');
    
    return HttpResponse.json({
      success: true,
      message: '미전송 알림 Pull 성공',
      data: {
        notifications: undeliveredNotifications
      }
    });
  }),

  // 단건 읽음 처리 (PATCH /api/notifications/{notificationUuid}/read)
  http.patch('/api/notifications/:notificationUuid/read', async ({ params }) => {
    const { notificationUuid } = params;
    const notification = mockNotifications.find(n => n.id === notificationUuid);
    
    if (!notification) {
      return HttpResponse.json(
        { success: false, message: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    notification.isRead = true;
    (notification as any).readAt = new Date().toISOString();
    
    console.log('[MSW] PATCH /api/notifications/' + notificationUuid + '/read');
    return HttpResponse.json({
      success: true,
      message: '알림이 읽음으로 표시되었습니다.'
    });
  }),

  // 단건 delivered 처리 (PATCH /api/notifications/{notificationUuid}/delivered)
  http.patch('/api/notifications/:notificationUuid/delivered', ({ params }) => {
    const { notificationUuid } = params;
    const notification = mockNotifications.find(n => n.id === notificationUuid);
    
    if (!notification) {
      return HttpResponse.json(
        { success: false, message: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    (notification as any).delivered = true;
    (notification as any).deliveredAt = new Date().toISOString();
    
    console.log('[MSW] PATCH /api/notifications/' + notificationUuid + '/delivered');
    return HttpResponse.json({
      success: true,
      message: '알림이 delivered로 표시되었습니다.'
    });
  }),

  // 전체 읽음 처리 (POST /api/notifications/read-all)
  http.post('/api/notifications/read-all', () => {
    mockNotifications.forEach(notification => {
      notification.isRead = true;
      (notification as any).readAt = new Date().toISOString();
    });
    
    console.log('[MSW] POST /api/notifications/read-all - marked', mockNotifications.length, 'notifications as read');
    return HttpResponse.json({
      success: true,
      message: '모든 알림이 읽음으로 표시되었습니다.'
    });
  }),

  // 알림 삭제 (DELETE /api/notifications/{notificationUuid})
  http.delete('/api/notifications/:notificationUuid', ({ params }) => {
    const { notificationUuid } = params;
    const index = mockNotifications.findIndex(n => n.id === notificationUuid);
    
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const deletedNotification = mockNotifications.splice(index, 1)[0];
    
    console.log('[MSW] DELETE /api/notifications/' + notificationUuid);
    return HttpResponse.json({
      success: true,
      message: '알림이 삭제되었습니다.',
      data: {
        deletedNotification
      }
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

  // 알림 생성 (POST /api/notifications)
  http.post('/api/notifications', async ({ request }) => {
    const notificationData = await request.json() as any;
    
    // 새 알림 생성
    const newNotification: NotificationItem = {
      id: `notification_${Date.now()}`,
      title: notificationData.title || '새 알림',
      message: notificationData.content || notificationData.message || '알림 메시지',
      type: notificationData.type || 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
      slotId: notificationData.slotId,
      accountId: notificationData.accountId,
      pushData: {
        targetScreen: '/(tabs)/notifications'
      }
    };
    
    // Mock 데이터에 추가
    mockNotifications.unshift(newNotification);
    
    console.log('[MSW] POST /api/notifications - created notification:', newNotification.id);
    return HttpResponse.json({
      success: true,
      data: {
        notification: newNotification
      },
      message: '알림이 생성되었습니다.'
    });
  }),

  // ===== Device Management APIs =====
  
  // FCM 토큰 등록 (POST /api/notifications/register-fcm-token)
  http.post('/api/notifications/register-fcm-token', async ({ request }) => {
    const data = await request.json() as any;
    console.log('[MSW] FCM 토큰 등록:', {
      deviceId: data.deviceId,
      platform: data.platform,
      hasToken: !!data.fcmToken
    });
    
    return HttpResponse.json({
      success: true,
      message: 'FCM 토큰이 성공적으로 등록되었습니다.',
      data: {
        deviceId: data.deviceId,
        registered: true,
        tokenUpdated: true
      }
    });
  }),
  
  // FCM/WebPush 토큰 교체 (POST /api/devices/{deviceId}/token)
  http.post('/api/devices/:deviceId/token', async ({ params, request }) => {
    const { deviceId } = params;
    const data = await request.json() as any;
    console.log('[MSW] POST /api/devices/' + deviceId + '/token:', data);
    
    return HttpResponse.json({
      success: true,
      message: 'FCM 토큰이 교체되었습니다.',
      data: {
        device: {
          deviceId,
          platform: 'ANDROID',
          status: 'ACTIVE',
          pushEnabled: true,
          tokenPresent: !!data.token
        }
      }
    });
  }),

  // 단건 안읽음 처리 (PATCH /api/notifications/{notificationUuid}/unread)
  http.patch('/api/notifications/:notificationUuid/unread', async ({ params }) => {
    const { notificationUuid } = params;
    const notification = mockNotifications.find(n => n.id === notificationUuid);
    
    if (!notification) {
      return HttpResponse.json(
        { success: false, message: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    notification.isRead = false;
    (notification as any).readAt = null;
    
    console.log('[MSW] PATCH /api/notifications/' + notificationUuid + '/unread');
    return HttpResponse.json({
      success: true,
      message: '알림이 안읽음으로 표시되었습니다.'
    });
  }),

  // ===== Legacy/Development APIs =====
  
  // 레거시 호환용 - 알림 상태 토글
  http.patch('/api/notifications/:id/toggle-read', ({ params }) => {
    const { id } = params;
    const notification = mockNotifications.find(n => n.id === id);
    
    if (!notification) {
      return HttpResponse.json(
        { success: false, message: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    notification.isRead = !notification.isRead;
    
    console.log('[MSW] PATCH /api/notifications/' + id + '/toggle-read ->', notification.isRead ? 'read' : 'unread');
    return HttpResponse.json({
      success: true,
      data: notification
    });
  }),
  
];