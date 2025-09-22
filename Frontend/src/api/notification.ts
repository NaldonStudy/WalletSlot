import { featureFlags } from '@/src/config/featureFlags';
import { ENABLE_NOTIFICATION_FALLBACK } from '@/src/constants/api';
import type {
    BaseResponse,
    NotificationItem,
    NotificationSettings,
    PaginatedResponse,
    SendNotificationRequest,
    UpdateTokenRequest
} from '@/src/types';
import { apiClient } from './client';
import { fetchNotificationsFallback, isAmbiguousAxiosBody, normalizeNotificationList } from './responseNormalizer';

/**
 * 푸시 알림 관련 API 함수들
 */
export const notificationApi = {
  /**
   * 특정 사용자에게 알림 생성 (POST /api/notifications)
   */
  createNotification: async (data: {
    title: string;
    message: string;
    type: NotificationItem['type'];
    slotId?: number;
    accountId?: number;
    pushData?: any;
  }): Promise<BaseResponse<NotificationItem>> => {
    try {
      return await apiClient.post('/api/notifications', data);
    } catch (error) {
      console.error('[NOTIF_API] 알림 생성 실패:', error);
      return {
        success: false,
        data: {} as NotificationItem,
        message: '알림 생성에 실패했습니다.'
      };
    }
  },

  /**
   * 앱 접속 시 "미접속 알림" 일괄 조회 후 전송 처리 (POST /api/notifications/pull)
   */
  pullNotifications: async (): Promise<BaseResponse<NotificationItem[]>> => {
    try {
      return await apiClient.post('/api/notifications/pull');
    } catch (error) {
      console.error('[NOTIF_API] 미접속 알림 조회 실패:', error);
      return {
        success: false,
        data: [],
        message: '미접속 알림 조회에 실패했습니다.'
      };
    }
  },

  /**
   * 알림 하나 전송 처리 (PATCH /api/notifications/{notificationId}/delivered)
   */
  markAsDelivered: async (notificationId: string): Promise<BaseResponse<void>> => {
    try {
      return await apiClient.patch(`/api/notifications/${notificationId}/delivered`);
    } catch (error) {
      console.error('[NOTIF_API] 알림 전송 처리 실패:', error);
      return {
        success: false,
        data: undefined,
        message: '알림 전송 처리에 실패했습니다.'
      };
    }
  },

  /**
   * 푸시 토큰 갱신 (앱 실행시 토큰이 변경된 경우)
   */
  updatePushToken: async (data: UpdateTokenRequest): Promise<BaseResponse<void>> => {
    try {
      return await apiClient.put('/notifications/update-token', data);
    } catch (error) {
      console.error('[NOTIF_API] 푸시 토큰 갱신 실패:', error);
      throw error;
    }
  },



  /**
   * 사용자의 알림 목록 조회
   */
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: NotificationItem['type'];
  }): Promise<PaginatedResponse<NotificationItem>> => {
    /**
     * 변경 사항 요약:
     * 1) 응답 형태 분기 로직을 responseNormalizer로 위임
     * 2) axios 응답이 모호(빈 문자열/빈 객체)한 경우에만 fallback fetch 수행
     * 3) 최종적으로 항상 PaginatedResponse 형태 보장
     */
    try {
      const raw: any = await apiClient.get('/api/notifications', params);
  console.log('[NOTIF_API] getNotifications raw(type, keys)=', typeof raw, raw && typeof raw === 'object' ? Object.keys(raw) : 'n/a');

      // 모호한 응답이면 fallback fetch 시도
        // 런타임 토글 가능한 feature flag 우선 사용, 없으면 빌드타임 상수
        const enableFallback = featureFlags.isNotificationFallbackEnabled() ?? ENABLE_NOTIFICATION_FALLBACK;
        if (enableFallback && isAmbiguousAxiosBody(raw)) {
  console.log('[NOTIF_API] ambiguous axios body detected -> fallback fetch');
        const fallback = await fetchNotificationsFallback(params as any);
        if (fallback) return fallback;
      }

      // 정상 경로: 정규화
      return normalizeNotificationList(raw, params);
    } catch (error) {
  console.error('[NOTIF_API] 알림 목록 조회 실패:', error);
      return {
        success: false,
        data: [],
        message: '알림 목록 조회에 실패했습니다.',
        meta: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: 0,
          hasNext: false
        }
      };
    }
  },

  /**
   * 특정 알림을 읽음으로 표시 (PATCH /api/notifications/{notificationId}/read)
   */
  markAsRead: async (notificationId: string): Promise<BaseResponse<void>> => {
    try {
      return await apiClient.patch(`/api/notifications/${notificationId}/read`, {
        isRead: true,
        readAt: new Date().toISOString()
      });
    } catch (error) {
  console.error('[NOTIF_API] 알림 읽음 처리 실패:', error);
      return {
        success: false,
        data: undefined,
        message: '알림 읽음 처리에 실패했습니다.'
      };
    }
  },

  /**
   * 특정 알림을 안읽음으로 표시 (PATCH /api/notifications/{notificationId}/read)
   */
  markAsUnread: async (notificationId: string): Promise<BaseResponse<void>> => {
    try {
      return await apiClient.patch(`/api/notifications/${notificationId}/read`, {
        isRead: false,
        readAt: null
      });
    } catch (error) {
  console.error('[NOTIF_API] 알림 안읽음 처리 실패:', error);
      return {
        success: false,
        data: undefined,
        message: '알림 안읽음 처리에 실패했습니다.'
      };
    }
  },

  /**
   * 모든 알림을 읽음으로 표시 (POST /api/notifications/read-all)
   */
  markAllAsRead: async (): Promise<BaseResponse<void>> => {
    try {
      return await apiClient.post('/api/notifications/read-all');
    } catch (error) {
  console.error('[NOTIF_API] 전체 알림 읽음 처리 실패:', error);
      return {
        success: false,
        data: undefined,
        message: '전체 알림 읽음 처리에 실패했습니다.'
      };
    }
  },

  /**
   * 알림 설정 조회
   */
  getSettings: async (): Promise<BaseResponse<NotificationSettings>> => {
    try {
      return await apiClient.get('/api/notifications/settings');
    } catch (error) {
  console.error('[NOTIF_API] 알림 설정 조회 실패:', error);
      return {
        success: false,
        data: {
          pushEnabled: true,
          budgetAlertsEnabled: true,
          goalAlertsEnabled: true,
          spendingPatternEnabled: true,
          systemAlertsEnabled: true
        },
        message: '알림 설정 조회에 실패했습니다.'
      };
    }
  },

  /**
   * 알림 설정 업데이트
   */
  updateSettings: async (settings: Partial<NotificationSettings>): Promise<BaseResponse<NotificationSettings>> => {
    try {
      return await apiClient.put('/api/notifications/settings', settings);
    } catch (error) {
  console.error('[NOTIF_API] 알림 설정 업데이트 실패:', error);
      return {
        success: false,
        data: {
          pushEnabled: true,
          budgetAlertsEnabled: true,
          goalAlertsEnabled: true,
          spendingPatternEnabled: true,
          systemAlertsEnabled: true,
          ...settings
        },
        message: '알림 설정 업데이트에 실패했습니다.'
      };
    }
  },

  /**
   * 테스트 알림 전송 (개발용)
   */
  sendTestNotification: async (data: SendNotificationRequest): Promise<BaseResponse<void>> => {
    try {
      return await apiClient.post('/notifications/send-test', data);
    } catch (error) {
      console.error('[NOTIF_API] 테스트 알림 전송 실패:', error);
      // TODO: 실제 API 구현 전까지 임시 응답
      return {
        success: true,
        data: undefined,
        message: '테스트 알림이 전송되었습니다 (Mock)'
      };
    }
  },

  /**
   * 알림 삭제 (DELETE /api/notifications/{notificationId})
   */
  deleteNotification: async (notificationId: string): Promise<BaseResponse<void>> => {
    try {
      return await apiClient.delete(`/api/notifications/${notificationId}`);
    } catch (error) {
  console.error('[NOTIF_API] 알림 삭제 실패:', error);
      return {
        success: false,
        data: undefined,
        message: '알림 삭제에 실패했습니다.'
      };
    }
  },

  /**
   * 읽지 않은 알림 개수 조회
   */
  getUnreadCount: async (): Promise<BaseResponse<{ count: number }>> => {
    try {
      const raw = await apiClient.get('/api/notifications/unread-count') as any;
      console.log('[NOTIF_API] getUnreadCount raw:', raw);

      // apiClient는 가능한 한 { success, data } 형태로 반환합니다.
      if (raw && typeof raw === 'object') {
        if (raw.success && raw.data && typeof raw.data.count === 'number') {
          return { success: true, data: { count: raw.data.count }, message: raw.message || '읽지 않은 알림 개수 조회 완료' };
        }
        // MSW가 직접 { count }로 반환한 경우도 고려
        if (typeof raw.count === 'number') {
          return { success: true, data: { count: raw.count }, message: '읽지 않은 알림 개수 조회 완료' };
        }
        // 그 외에는 raw.data 자체를 시도
        if (raw.data && typeof raw.data.count === 'number') {
          return { success: true, data: { count: raw.data.count }, message: raw.message || '읽지 않은 알림 개수 조회 완료' };
        }
      }

      // 안전한 기본값
      return { success: true, data: { count: 0 }, message: '읽지 않은 알림 개수 조회 완료' };
    } catch (error) {
  console.error('[NOTIF_API] 읽지 않은 알림 개수 조회 실패:', error);
      return {
        success: false,
        data: { count: 0 },
        message: '읽지 않은 알림 개수 조회에 실패했습니다.'
      };
    }
  },

    /**
   *  로그인 시, 로컬에 저장된 알림 여부 없을 경우, 서버 조회(구현 미완)
   *  true로 일단 하드 코딩.
   */
  async getUserNotificationSettings(): Promise<{ success: boolean; data: { isPushEnabled: boolean } }> {
    try {
      // TODO: 실제 API 호출 구현 (공통 헤더 포함)
      // const response = await fetch('/api/user/notification-settings', {
      //   headers: {
      //     'Authorization': `Bearer ${accessToken}`,
      //     'X-Device-Id': deviceId,
      //     'Content-Type': 'application/json',
      //   },
      // });
      
      console.log('[API_NOTIFICATION] 📝사용자 알림 설정 조회 (기본값)');
      return {
        success: true,
        data: { isPushEnabled: true }
      };
    } catch (error) {
      console.error('[API_NOTIFICATION] ❌사용자 알림 설정 조회 실패:', error);
      return {
        success: false,
        data: { isPushEnabled: true },
      };
    }
  }
};
