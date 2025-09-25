/*
 * 🎭 MSW 핸들러 통합 파일
 *
 * 모든 API Mock 핸들러를 한 곳에서 관리
 * 도메인별로 분리된 핸들러들을 조합
 */

import { http, HttpResponse, passthrough } from 'msw';

// 각 도메인별 핸들러 import
import { accountHandlers } from './accounts';
import { mydataHttpHandlers } from './mydataHttpHandlers';
import { notificationHandlers } from './notifications';
import { profileHandlers } from './profile';
import { reportHandlers } from './report';
import { settingsHandlers } from './settings';
import { settingsHttpHandlers } from './settingsHttpHandlers';
import { slotHandlers } from './slots';

// ✅ 1. Expo 개발 서버의 내부 통신을 통과시키는 핸들러
const internalHandlers = [
  // symbolicate 요청은 MSW가 처리하지 않고 그대로 통과시킵니다.
  http.post('/symbolicate', () => {
    return passthrough();
  }),
];

// 기본 상태 확인 핸들러
const baseHandlers = [
  // MSW 서버 상태 확인용 엔드포인트
  http.get('https://api.walletslot.com/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      message: 'MSW 서버가 정상 작동 중입니다',
      timestamp: new Date().toISOString(),
      environment: 'development',
    });
  }),

  // 기본 API 정보
  http.get('https://api.walletslot.com/api', () => {
    return HttpResponse.json({
      name: 'WalletSlot Mock API',
      version: '1.0.0',
      description: 'MSW를 사용한 Mock API 서버',
      endpoints: {
        notifications: '/api/notifications/*',
        profile: '/api/users/me/*'
      },
    });
  }),
];

// 모든 핸들러 통합
export const handlers = [
  ...internalHandlers, // ✅ 2. 통과 핸들러를 가장 위에 추가
  ...baseHandlers,
  ...slotHandlers,
  ...notificationHandlers,
  ...profileHandlers,
  ...reportHandlers,
  ...settingsHandlers, // 새로운 설정 API 핸들러
  ...mydataHttpHandlers, // 상세한 mydata 핸들러를 먼저
  ...settingsHttpHandlers,
];