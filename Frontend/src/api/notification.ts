import { featureFlags } from '@/src/config/featureFlags';
import { ENABLE_NOTIFICATION_FALLBACK } from '@/src/constants/api';
import type {
  BaseResponse,
  CountUnreadResponseDto,
  CreateNotificationRequestDto,
  GetNotificationPageResponseDto,
  NotificationItem,
  NotificationSettings,
  PaginatedResponse,
  PullNotificationListResponseDto,
  RegisterDeviceRequestDto,
  RegisterDeviceResponseDto,
  SendNotificationRequest,
  SimpleOkResponseDto,
  UpdateDeviceRequestDto,
  UpdateTokenRequest
} from '@/src/types';
import { apiClient } from './client';
import { fetchNotificationsFallback, isAmbiguousAxiosBody, normalizeNotificationList } from './responseNormalizer';

const VALID_NOTIFICATION_TYPES: ReadonlySet<NotificationItem['type']> = new Set([
  'SYSTEM',
  'DEVICE',
  'BUDGET',
  'TRANSACTION',
  'MARKETING',
]);

const isRecord = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null;

const parseOptionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const extractPushData = (...sources: Array<Record<string, any> | undefined>): NotificationItem['pushData'] | undefined => {
  for (const source of sources) {
    if (!source) continue;
    const candidate = isRecord(source.pushData) ? source.pushData : source;
    if (!candidate || typeof candidate !== 'object') continue;
    const action = candidate.action ?? candidate.data?.action;
    const targetScreen = candidate.targetScreen ?? candidate.data?.targetScreen ?? candidate.screen;
    const params = candidate.params ?? candidate.data ?? candidate.payload ?? candidate.meta;

    if (action || targetScreen || params) {
      return {
        action: action ?? undefined,
        targetScreen: targetScreen ?? undefined,
        params,
      };
    }
  }
  return undefined;
};

const normalizeNotificationItem = (raw: any): NotificationItem => {
  const metadata = isRecord(raw?.metadata) ? raw.metadata : undefined;
  const dataField = isRecord(raw?.data) ? raw.data : undefined;
  const extra = isRecord(raw?.extra) ? raw.extra : undefined;

  const candidateId = raw?.id
    ?? raw?.uuid
    ?? raw?.notificationUuid
    ?? metadata?.id
    ?? metadata?.uuid
    ?? metadata?.notificationUuid
    ?? dataField?.id
    ?? dataField?.uuid
    ?? dataField?.notificationUuid;

  const id = candidateId ? String(candidateId) : `notif_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;

  const title = raw?.title ?? metadata?.title ?? dataField?.title ?? extra?.title ?? '알림';
  const message =
    raw?.message ??
    raw?.content ??
    metadata?.message ??
    metadata?.content ??
    dataField?.message ??
    dataField?.content ??
    extra?.message ??
    extra?.content ??
    '';

  const rawType = (raw?.type ?? metadata?.type ?? dataField?.type ?? extra?.type) as NotificationItem['type'] | string | undefined;
  const type: NotificationItem['type'] = rawType && VALID_NOTIFICATION_TYPES.has(rawType as NotificationItem['type'])
    ? (rawType as NotificationItem['type'])
    : 'SYSTEM';

  const readFlag =
    typeof raw?.isRead === 'boolean' ? raw.isRead
    : typeof raw?.read === 'boolean' ? raw.read
    : typeof raw?.status === 'string' ? raw.status.toUpperCase() === 'READ'
    : typeof metadata?.isRead === 'boolean' ? metadata.isRead
    : typeof metadata?.read === 'boolean' ? metadata.read
    : false;

  const createdAt = raw?.createdAt
    ?? raw?.sentAt
    ?? raw?.updatedAt
    ?? metadata?.createdAt
    ?? dataField?.createdAt
    ?? extra?.createdAt
    ?? new Date().toISOString();

  const readAt = raw?.readAt ?? metadata?.readAt ?? dataField?.readAt ?? (readFlag ? raw?.updatedAt ?? metadata?.updatedAt ?? null : null);
  const deliveredAt = raw?.deliveredAt ?? metadata?.deliveredAt ?? dataField?.deliveredAt ?? null;

  const slotId = parseOptionalNumber(raw?.slotId ?? metadata?.slotId ?? dataField?.slotId ?? extra?.slotId);
  const accountId = parseOptionalNumber(raw?.accountId ?? metadata?.accountId ?? dataField?.accountId ?? extra?.accountId);
  const transactionIdCandidate = raw?.transactionId ?? metadata?.transactionId ?? dataField?.transactionId ?? extra?.transactionId;
  const transactionId = transactionIdCandidate != null ? String(transactionIdCandidate) : undefined;

  const pushData = extractPushData(raw, metadata, dataField, extra);

  return {
    id,
    title: title || '알림',
    message,
    type,
    isRead: Boolean(readFlag),
    createdAt,
    slotId,
    accountId,
    transactionId,
    pushData,
    readAt: readAt ?? null,
    deliveredAt: deliveredAt ?? null,
  };
};

const normalizeNotificationCollection = (items: unknown): NotificationItem[] => {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeNotificationItem);
};

/**
 * 푸시 알림 관련 API 함수들
 */
export const notificationApi = {
  // ===== Push Endpoint Management =====
  
  /**
   * 푸시 엔드포인트 등록/갱신 (POST /api/push/endpoints)
   */
  registerPushEndpoint: async (data: RegisterDeviceRequestDto): Promise<RegisterDeviceResponseDto> => {
    try {
      const response = await apiClient.post('/api/push/endpoints', data);
      return response as RegisterDeviceResponseDto;
    } catch (error) {
      console.error('[NOTIF_API] 푸시 엔드포인트 등록 실패:', error);
      return {
        success: false,
        message: '푸시 엔드포인트 등록에 실패했습니다.',
        data: {
          device: {
            deviceId: '',
            platform: data.platform,
            status: 'LOGGED_OUT',
            pushEnabled: false,
            tokenPresent: false
          }
        }
      };
    }
  },

  /**
   * 내 푸시 엔드포인트 목록 조회 (GET /api/push/endpoints)
   */
  getPushEndpoints: async () => {
    try {
      return await apiClient.get('/api/push/endpoints');
    } catch (error) {
      console.error('[NOTIF_API] 푸시 엔드포인트 목록 조회 실패:', error);
      return {
        success: false,
        data: { devices: [] },
        message: '푸시 엔드포인트 목록 조회에 실패했습니다.'
      };
    }
  },

  /**
   * 푸시 엔드포인트 부분 수정 (PATCH /api/push/endpoints/{deviceId})
   */
  updatePushEndpoint: async (deviceId: string, data: UpdateDeviceRequestDto) => {
    try {
      return await apiClient.patch(`/api/push/endpoints/${deviceId}`, data);
    } catch (error) {
      console.error('[NOTIF_API] 푸시 엔드포인트 수정 실패:', error);
      return {
        success: false,
        data: null,
        message: '푸시 엔드포인트 수정에 실패했습니다.'
      };
    }
  },

  /**
   * 푸시 엔드포인트 삭제 (DELETE /api/push/endpoints/{deviceId})
   */
  deletePushEndpoint: async (deviceId: string) => {
    try {
      return await apiClient.delete(`/api/push/endpoints/${deviceId}`);
    } catch (error) {
      console.error('[NOTIF_API] 푸시 엔드포인트 삭제 실패:', error);
      return {
        success: false,
        data: null,
        message: '푸시 엔드포인트 삭제에 실패했습니다.'
      };
    }
  },

  // ===== Notification Management =====

  /**
   * 알림 생성 (POST /api/notifications)
   */
  createNotification: async (data: CreateNotificationRequestDto): Promise<BaseResponse<NotificationItem>> => {
    try {
      const response = await apiClient.post('/api/notifications', data);
      if (response?.success && response?.data) {
        return {
          ...response,
          data: normalizeNotificationItem(response.data),
        } as BaseResponse<NotificationItem>;
      }
      return response as BaseResponse<NotificationItem>;
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
   * 미전송 Pull + delivered 처리 (POST /api/notifications/pull)
   */
  pullNotifications: async (): Promise<PullNotificationListResponseDto> => {
    try {
      const response = await apiClient.post('/api/notifications/pull');
      const baseData: Record<string, any> = isRecord(response?.data) ? response!.data : {};
      return {
        ...(response ?? { success: false, message: '미전송 알림 조회에 실패했습니다.' }),
        data: {
          ...baseData,
          notifications: normalizeNotificationCollection(baseData?.notifications),
        },
      } as PullNotificationListResponseDto;
    } catch (error) {
      console.error('[NOTIF_API] 미전송 알림 Pull 실패:', error);
      return {
        success: false,
        data: { notifications: [] },
        message: '미전송 알림 조회에 실패했습니다.'
      };
    }
  },

  /**
   * 단건 delivered 처리 (PATCH /api/notifications/{notificationUuid}/delivered)
   */
  markAsDelivered: async (notificationUuid: string): Promise<SimpleOkResponseDto> => {
    try {
      const response = await apiClient.patch(`/api/notifications/${notificationUuid}/delivered`);
      return response as SimpleOkResponseDto;
    } catch (error) {
      console.error('[NOTIF_API] 알림 전송 처리 실패:', error);
      return {
        success: false,
        message: '알림 전송 처리에 실패했습니다.'
      };
    }
  },

  /**
   * 푸시 토큰 갱신 (레거시 호환용 - 새로운 API 사용 권장)
   */
  updatePushToken: async (data: UpdateTokenRequest): Promise<BaseResponse<void>> => {
    try {
      // 새로운 API 엔드포인트 사용
      await apiClient.post(`/api/devices/${data.deviceId}/token`, {
        token: data.token
      });
      return {
        success: true,
        data: undefined,
        message: '푸시 토큰이 성공적으로 갱신되었습니다.'
      };
    } catch (error) {
      console.error('[NOTIF_API] 푸시 토큰 갱신 실패:', error);
      return {
        success: false,
        data: undefined,
        message: '푸시 토큰 갱신에 실패했습니다.'
      };
    }
  },



  /**
   * 알림 목록 조회 (GET /api/notifications)
   * type 필터 및 페이지네이션 지원
   */
  getNotifications: async (params?: {
    type?: 'SYSTEM' | 'DEVICE' | 'BUDGET' | 'TRANSACTION' | 'MARKETING';
    page?: number;
    size?: number;
    sort?: string[];
  }): Promise<GetNotificationPageResponseDto> => {
    try {
      // API 명세에 맞춰 파라미터 구성
      const queryParams: any = {};
      if (params?.type) queryParams.type = params.type;
      if (params?.page !== undefined) queryParams.page = params.page;
      if (params?.size !== undefined) queryParams.size = params.size;
      if (params?.sort) queryParams.sort = params.sort;

      const response = await apiClient.get('/api/notifications', queryParams);
      console.log('[NOTIF_API] getNotifications response:', response);

      const safeResponse: BaseResponse<any> = (response as BaseResponse<any>) ?? {
        success: false,
        message: '알림 목록 조회에 실패했습니다.',
        data: {},
      };
      const rawData: Record<string, any> = isRecord(safeResponse.data) ? safeResponse.data : {};
      const normalizedContent = normalizeNotificationCollection(rawData?.content);
      // 서버가 page 정보를 data.page 객체가 아닌 data의 최상위 필드들(page,size,totalElements,totalPages,first,last)로 반환하는 경우 처리
      const rawPageObj = isRecord(rawData?.page) ? rawData.page : undefined;
      const topPageNumber = typeof rawData?.page === 'number' ? rawData.page : undefined;
      const topPageSize = typeof rawData?.size === 'number' ? rawData.size : undefined;
      const topTotalElements = typeof rawData?.totalElements === 'number' ? rawData.totalElements : undefined;
      const topTotalPages = typeof rawData?.totalPages === 'number' ? rawData.totalPages : undefined;
      const topFirst = typeof rawData?.first === 'boolean' ? rawData.first : undefined;
      const topLast = typeof rawData?.last === 'boolean' ? rawData.last : undefined;

      const requestedPage = params?.page ?? 0;
      const requestedSize = params?.size ?? 20;

      const pageNumber = typeof rawPageObj?.number === 'number'
        ? rawPageObj.number
        : (topPageNumber ?? requestedPage);
      const pageSize = typeof rawPageObj?.size === 'number'
        ? rawPageObj.size
        : (topPageSize ?? requestedSize ?? (normalizedContent.length || 20));
      const totalElements = typeof rawPageObj?.totalElements === 'number'
        ? rawPageObj.totalElements
        : (topTotalElements ?? normalizedContent.length);
      const computedTotalPages = pageSize > 0 ? Math.ceil((totalElements || 0) / pageSize) : 0;
      const totalPages = typeof rawPageObj?.totalPages === 'number'
        ? rawPageObj.totalPages
        : (topTotalPages ?? computedTotalPages);
      const isFirst = typeof rawPageObj?.first === 'boolean'
        ? rawPageObj.first
        : (topFirst ?? (pageNumber <= 0));
      const isLast = typeof rawPageObj?.last === 'boolean'
        ? rawPageObj.last
        : (topLast ?? (totalPages <= 1 || pageNumber >= (totalPages - 1)));

      return {
        ...safeResponse,
        data: {
          ...rawData,
          content: normalizedContent,
          page: {
            number: pageNumber,
            size: pageSize,
            totalElements,
            totalPages,
            first: isFirst,
            last: isLast,
          },
        },
      } as GetNotificationPageResponseDto;
    } catch (error) {
      console.error('[NOTIF_API] 알림 목록 조회 실패:', error);
      return {
        success: false,
        message: '알림 목록 조회에 실패했습니다.',
        data: {
          content: [],
          page: {
            number: params?.page || 0,
            size: params?.size || 20,
            totalElements: 0,
            totalPages: 0,
            first: true,
            last: true
          }
        }
      };
    }
  },

  /**
   * 레거시 호환용 알림 목록 조회 (기존 인터페이스 유지)
   */
  getNotificationsLegacy: async (params?: {
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
      console.log('[NOTIF_API] getNotificationsLegacy raw(type, keys)=', typeof raw, raw && typeof raw === 'object' ? Object.keys(raw) : 'n/a');

      // 모호한 응답이면 fallback fetch 시도
        // 런타임 토글 가능한 feature flag 우선 사용, 없으면 빌드타임 상수
        const enableFallback = featureFlags.isNotificationFallbackEnabled() ?? ENABLE_NOTIFICATION_FALLBACK;
        if (enableFallback && isAmbiguousAxiosBody(raw)) {
          console.log('[NOTIF_API] ambiguous axios body detected -> fallback fetch');
        const fallback = await fetchNotificationsFallback(params as any);
        if (fallback) return fallback;
      }

      // 정상 경로: 정규화 후 새 구조에 맞춰 매핑
      const normalized = normalizeNotificationList(raw, params);
      const data = Array.isArray(normalized.data)
        ? normalized.data.map(normalizeNotificationItem)
        : normalizeNotificationCollection(normalized.data as any);
      return {
        ...normalized,
        data,
      };
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
   * 단건 읽음 처리 (PATCH /api/notifications/{notificationUuid}/read)
   */
  markAsRead: async (notificationUuid: string): Promise<SimpleOkResponseDto> => {
    try {
      const response = await apiClient.patch(`/api/notifications/${notificationUuid}/read`);
      return response as SimpleOkResponseDto;
    } catch (error) {
      console.error('[NOTIF_API] 알림 읽음 처리 실패:', error);
      return {
        success: false,
        message: '알림 읽음 처리에 실패했습니다.'
      };
    }
  },

  /**
   * 단건 안읽음 처리 - 서버 OpenAPI에는 별도 'unread' 엔드포인트가 없음.
   * 클라이언트는 로컬 상태만 토글하고, 서버에는 별도 호출을 하지 않습니다.
   */
  markAsUnread: async (_notificationUuid: string): Promise<SimpleOkResponseDto> => ({ success: true, message: 'client-only unread' }),

  /**
   * 전체 읽음 처리 (POST /api/notifications/read-all)
   */
  markAllAsRead: async (): Promise<SimpleOkResponseDto> => {
    try {
      const response = await apiClient.post('/api/notifications/read-all');
      return response as SimpleOkResponseDto;
    } catch (error) {
      console.error('[NOTIF_API] 전체 알림 읽음 처리 실패:', error);
      return {
        success: false,
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
   * 알림 삭제 (DELETE /api/notifications/{notificationUuid})
   */
  deleteNotification: async (notificationUuid: string) => {
    try {
      return await apiClient.delete(`/api/notifications/${notificationUuid}`);
    } catch (error) {
      console.error('[NOTIF_API] 알림 삭제 실패:', error);
      return {
        success: false,
        data: null,
        message: '알림 삭제에 실패했습니다.'
      };
    }
  },

  /**
   * 미읽음 개수 조회 (GET /api/notifications/unread-count)
   */
  getUnreadCount: async (): Promise<CountUnreadResponseDto> => {
    try {
      const response = await apiClient.get('/api/notifications/unread-count');
      console.log('[NOTIF_API] getUnreadCount response:', response);
      
      return response as CountUnreadResponseDto;
    } catch (error) {
      console.error('[NOTIF_API] 미읽음 알림 개수 조회 실패:', error);
      return {
        success: false,
        data: { count: 0 },
        message: '미읽음 알림 개수 조회에 실패했습니다.'
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
