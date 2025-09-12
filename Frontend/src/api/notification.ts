import type {
  BaseResponse,
  InitialTokenRequest,
  InitialTokenResponse,
  NotificationItem,
  NotificationSettings,
  PaginatedResponse,
  SendNotificationRequest,
  UpdateTokenRequest
} from '@/src/types';
import { apiClient } from './client';

/**
 * 푸시 알림 관련 API 함수들
 */
export const notificationApi = {
  /**
   * 최초 푸시 토큰 등록 (알림 권한 허용시)
   */
  registerInitialPushToken: async (data: InitialTokenRequest): Promise<InitialTokenResponse> => {
    try {
      // TODO: 실제 API 구현시 서버에서 deviceId 반환하도록 수정 필요
      const response = await apiClient.post('/notifications/register-initial-token', data);
      
      // Mock response - 실제 구현에서는 서버에서 deviceId 반환
      return {
        ...response,
        deviceId: `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      };
    } catch (error) {
      console.error('최초 푸시 토큰 등록 실패:', error);
      throw error;
    }
  },

  /**
   * 푸시 토큰 갱신 (앱 실행시 토큰이 변경된 경우)
   */
  updatePushToken: async (data: UpdateTokenRequest): Promise<BaseResponse<void>> => {
    try {
      return await apiClient.put('/notifications/update-token', data);
    } catch (error) {
      console.error('푸시 토큰 갱신 실패:', error);
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
    try {
      const response = await apiClient.get<NotificationItem[]>('/notifications', { params });
      return {
        success: response.success,
        data: response.data,
        message: response.message,
        errorCode: response.errorCode,
        meta: {
          page: params?.page || 1,
          limit: params?.limit || 20,
          total: Array.isArray(response.data) ? response.data.length : 0,
          hasNext: false
        }
      };
    } catch (error) {
      // 개발 중에는 조용히 처리 (콘솔 로그 없음)
      // console.error('알림 목록 조회 실패:', error);
      // TODO: 실제 API 구현 전까지 임시 응답
      return {
        success: true,
        data: [], // Mock 데이터는 화면에서 생성
        message: '알림 목록 조회 완료 (Mock)',
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
   * 특정 알림을 읽음으로 표시
   */
  markAsRead: async (notificationId: string): Promise<BaseResponse<void>> => {
    try {
      return await apiClient.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      // TODO: 실제 API 구현 전까지 임시 응답
      return {
        success: true,
        data: undefined,
        message: '알림이 읽음으로 처리되었습니다 (Mock)'
      };
    }
  },

  /**
   * 모든 알림을 읽음으로 표시
   */
  markAllAsRead: async (): Promise<BaseResponse<void>> => {
    try {
      return await apiClient.patch('/notifications/read-all');
    } catch (error) {
      console.error('전체 알림 읽음 처리 실패:', error);
      // TODO: 실제 API 구현 전까지 임시 응답
      return {
        success: true,
        data: undefined,
        message: '모든 알림이 읽음으로 처리되었습니다 (Mock)'
      };
    }
  },

  /**
   * 알림 설정 조회
   */
  getSettings: async (): Promise<BaseResponse<NotificationSettings>> => {
    try {
      return await apiClient.get('/notifications/settings');
    } catch (error) {
      console.error('알림 설정 조회 실패:', error);
      // TODO: 실제 API 구현 전까지 임시 응답
      return {
        success: true,
        data: {
          pushEnabled: true,
          budgetAlertsEnabled: true,
          goalAlertsEnabled: true,
          spendingPatternEnabled: true,
          systemAlertsEnabled: true
        },
        message: '알림 설정 조회 완료 (Mock)'
      };
    }
  },

  /**
   * 알림 설정 업데이트
   */
  updateSettings: async (settings: Partial<NotificationSettings>): Promise<BaseResponse<NotificationSettings>> => {
    try {
      return await apiClient.put('/notifications/settings', settings);
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error);
      // TODO: 실제 API 구현 전까지 임시 응답
      return {
        success: true,
        data: {
          pushEnabled: true,
          budgetAlertsEnabled: true,
          goalAlertsEnabled: true,
          spendingPatternEnabled: true,
          systemAlertsEnabled: true,
          ...settings
        },
        message: '알림 설정이 업데이트되었습니다 (Mock)'
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
      console.error('테스트 알림 전송 실패:', error);
      // TODO: 실제 API 구현 전까지 임시 응답
      return {
        success: true,
        data: undefined,
        message: '테스트 알림이 전송되었습니다 (Mock)'
      };
    }
  },

  /**
   * 알림 삭제
   */
  deleteNotification: async (notificationId: string): Promise<BaseResponse<void>> => {
    try {
      return await apiClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      // TODO: 실제 API 구현 전까지 임시 응답
      return {
        success: true,
        data: undefined,
        message: '알림이 삭제되었습니다 (Mock)'
      };
    }
  },

  /**
   * 읽지 않은 알림 개수 조회
   */
  getUnreadCount: async (): Promise<BaseResponse<{ count: number }>> => {
    try {
      return await apiClient.get('/notifications/unread-count');
    } catch (error) {
      // 개발 중에는 조용히 처리 (콘솔 로그 없음)
      // console.error('읽지 않은 알림 개수 조회 실패:', error);
      // TODO: 실제 API 구현 전까지 임시 응답
      return {
        success: true,
        data: { count: 0 },
        message: '읽지 않은 알림 개수 조회 완료 (Mock)'
      };
    }
  }
};
