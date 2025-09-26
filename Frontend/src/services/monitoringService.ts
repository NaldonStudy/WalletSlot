/**
 * 모니터링 및 로깅 서비스
 * 
 * Sentry, LogRocket 등의 모니터링 도구와 연동하여
 * 앱의 성능, 오류, 사용자 행동을 추적합니다.
 */
import { BACKEND_AVAILABLE } from '@/src/constants/api';
import type { NotificationItem, NotificationSettings } from '@/src/types';

// 로그 레벨 정의
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// 이벤트 카테고리 정의
export enum EventCategory {
  NOTIFICATION = 'notification',
  USER_INTERACTION = 'user_interaction',
  API_CALL = 'api_call',
  PERFORMANCE = 'performance',
  ERROR = 'error'
}

// 로그 엔트리 인터페이스
interface LogEntry {
  level: LogLevel;
  category: EventCategory;
  event: string;
  data?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// 성능 메트릭 인터페이스
interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
}

class MonitoringService {
  private isInitialized = false;
  private sessionId: string;
  private userId?: string;
  private logs: LogEntry[] = [];
  private performanceMetrics: PerformanceMetric[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  /**
   * 모니터링 서비스 초기화
   */
  private async initialize() {
    try {
      // TODO: 실제 프로덕션에서는 Sentry 초기화
      // import * as Sentry from '@sentry/react-native';
      // Sentry.init({
      //   dsn: 'YOUR_SENTRY_DSN',
      //   environment: __DEV__ ? 'development' : 'production',
      //   enableNative: true,
      //   enableNativeCrashHandling: true,
      //   attachStacktrace: true,
      // });

      // TODO: LogRocket 초기화 (웹 버전의 경우)
      // import LogRocket from 'logrocket';
      // LogRocket.init('your-app-id');

      this.isInitialized = true;
      this.logEvent(LogLevel.INFO, EventCategory.USER_INTERACTION, 'monitoring_service_initialized', {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('모니터링 서비스 초기화 실패:', error);
    }
  }

  /**
   * 사용자 ID 설정 (로그인 후 호출)
   */
  setUserId(userId: string) {
    this.userId = userId;
    
    // TODO: Sentry 사용자 컨텍스트 설정
    // Sentry.setUser({ id: userId });
    
    // TODO: LogRocket 사용자 식별
    // LogRocket.identify(userId);
    
    this.logEvent(LogLevel.INFO, EventCategory.USER_INTERACTION, 'user_identified', {
      userId
    });
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 일반 이벤트 로깅
   */
  logEvent(
    level: LogLevel,
    category: EventCategory,
    event: string,
    data?: Record<string, any>
  ) {
    const logEntry: LogEntry = {
      level,
      category,
      event,
      data,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId
    };

    // 로컬 로그 저장
    this.logs.push(logEntry);
    
    // 개발 모드에서는 콘솔에 로그 출력
    if (__DEV__) {
      const logMethod = level === LogLevel.ERROR || level === LogLevel.FATAL ? 'error' :
                       level === LogLevel.WARN ? 'warn' : 'log';
      console[logMethod](`[${level.toUpperCase()}] ${category}:${event}`, data);
    }

    // TODO: 실제 모니터링 서비스로 전송
    // Sentry.addBreadcrumb({
    //   message: event,
    //   category: category,
    //   level: level as any,
    //   data
    // });

    // 로그 개수 제한 (메모리 관리)
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-500); // 최근 500개만 유지
    }
  }

  /**
   * 에러 로깅
   */
  logError(error: Error, context?: Record<string, any>) {
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context
    };

    this.logEvent(LogLevel.ERROR, EventCategory.ERROR, 'application_error', errorData);

    // TODO: Sentry로 에러 전송
    // Sentry.captureException(error, { extra: context });
  }

  /**
   * 성능 메트릭 기록
   */
  recordPerformanceMetric(metric: PerformanceMetric) {
    this.performanceMetrics.push({
      ...metric,
      tags: {
        ...metric.tags,
        sessionId: this.sessionId,
        userId: this.userId || 'anonymous'
      }
    });

    this.logEvent(LogLevel.INFO, EventCategory.PERFORMANCE, 'performance_metric', metric);

    // TODO: 성능 메트릭을 모니터링 서비스로 전송
    // Sentry.addBreadcrumb({
    //   message: `Performance: ${metric.name}`,
    //   data: metric
    // });

    // 메트릭 개수 제한
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-50);
    }
  }

  /**
   * 알림 관련 이벤트 로깅
   */
  logNotificationEvent(
    event: 'received' | 'opened' | 'dismissed' | 'action_taken' | 'settings_changed',
    data: {
      notificationId?: string;
      type?: NotificationItem['type'];
      settings?: Partial<NotificationSettings>;
      action?: string;
      metadata?: Record<string, any>;
    }
  ) {
    this.logEvent(LogLevel.INFO, EventCategory.NOTIFICATION, `notification_${event}`, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * API 호출 로깅
   */
  logApiCall(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    status: 'started' | 'success' | 'error',
    data?: {
      statusCode?: number;
      responseTime?: number;
      errorMessage?: string;
      requestData?: any;
    }
  ) {
    this.logEvent(LogLevel.INFO, EventCategory.API_CALL, `api_${status}`, {
      endpoint,
      method,
      ...data
    });
  }

  /**
   * 사용자 상호작용 로깅
   */
  logUserInteraction(
    interaction: 'button_click' | 'swipe' | 'scroll' | 'navigation' | 'setting_change',
    data?: Record<string, any>
  ) {
    this.logEvent(LogLevel.INFO, EventCategory.USER_INTERACTION, interaction, data);
  }

  /**
   * 설정 변경 로깅(편의 함수)
   */
  logSettingChange(key: string, enabled?: boolean, success?: boolean, extra?: Record<string, any>) {
    this.logUserInteraction('setting_change', { key, enabled, success, ...extra });
  }

  /**
   * 로그 내보내기 (디버깅용)
   */
  exportLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 성능 메트릭 내보내기
   */
  exportMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  /**
   * 로그 초기화
   */
  clearLogs() {
    this.logs = [];
    this.performanceMetrics = [];
    this.logEvent(LogLevel.INFO, EventCategory.USER_INTERACTION, 'logs_cleared');
  }

  /**
   * 서비스 정리
   */
  cleanup() {
    this.logEvent(LogLevel.INFO, EventCategory.USER_INTERACTION, 'monitoring_service_cleanup');
    
    // TODO: 남은 로그들을 서버로 전송
    if (BACKEND_AVAILABLE && this.logs.length > 0) {
      // 배치로 로그 전송
      this.flushLogs();
    }
  }

  /**
   * 로그를 서버로 전송 (배치 처리)
   */
  private async flushLogs() {
    try {
      if (!BACKEND_AVAILABLE || this.logs.length === 0) return;

      // TODO: 실제 API 구현
      // await apiClient.post('/logs/batch', {
      //   logs: this.logs,
      //   sessionId: this.sessionId,
      //   userId: this.userId
      // });

      console.log(`${this.logs.length}개의 로그를 서버로 전송 완료`);
      this.logs = [];
    } catch (error) {
      console.error('로그 전송 실패:', error);
    }
  }
}

// 싱글톤 인스턴스 생성
export const monitoringService = new MonitoringService();

// 편의 함수들
export const logNotificationReceived = (notification: NotificationItem) => {
  monitoringService.logNotificationEvent('received', {
    notificationId: notification.id,
    type: notification.type,
    metadata: {
      title: notification.title,
      isRead: notification.isRead
    }
  });
};

export const logNotificationOpened = (notification: NotificationItem) => {
  monitoringService.logNotificationEvent('opened', {
    notificationId: notification.id,
    type: notification.type
  });
};

export const logNotificationSettingsChanged = (
  settings: Partial<NotificationSettings>,
  previousSettings?: NotificationSettings
) => {
  monitoringService.logNotificationEvent('settings_changed', {
    settings,
    metadata: {
      previous: previousSettings,
      changed: Object.keys(settings)
    }
  });
};

export const logApiError = (
  endpoint: string,
  method: string,
  error: Error,
  statusCode?: number
) => {
  monitoringService.logApiCall(endpoint, method as any, 'error', {
    statusCode,
    errorMessage: error.message,
    responseTime: undefined
  });
  
  monitoringService.logError(error, {
    endpoint,
    method,
    statusCode
  });
};

export const logPerformance = (name: string, value: number, unit: 'ms' | 'bytes' | 'count' = 'ms') => {
  monitoringService.recordPerformanceMetric({ name, value, unit });
};