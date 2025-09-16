/*
 * 🎭 MSW 핸들러 통합 파일
 * 
 * 모든 API Mock 핸들러를 한 곳에서 관리
 * 도메인별로 분리된 핸들러들을 조합
 * 
 * 사용법:
 * 1. 각 기능 개발 브랜치에서 필요한 핸들러만 주석 해제
 * 2. 개발 중인 API에만 MSW Mock 적용
 * 3. 실제 백엔드 완성 후 점진적으로 MSW 비활성화
 */

import { http, HttpResponse } from 'msw';

// 각 도메인별 핸들러 import 예시
// import { notificationHandlers } from './notifications';

// 기본 상태 확인 핸들러
const baseHandlers = [
  // MSW 서버 상태 확인용 엔드포인트
  http.get('/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      message: 'MSW 서버가 정상 작동 중입니다',
      timestamp: new Date().toISOString(),
      environment: 'development'
    });
  }),

  // 기본 API 정보
  http.get('/api', () => {
    return HttpResponse.json({
      name: 'WalletSlot Mock API',
      version: '1.0.0',
      description: 'MSW를 사용한 Mock API 서버',
      endpoints: {
        auth: '/api/auth/*',
        accounts: '/api/accounts/*',
        notifications: '/api/notifications/*',
        slots: '/api/slots/*'
      }
    });
  })
];

// 모든 핸들러 통합 예시
export const handlers = [
  ...baseHandlers,
  // ...notificationHandlers,
];