/*
 * 🧪 Jest + MSW 테스트 설정
 * 
 * 테스트 환경에서 MSW를 사용하기 위한 설정
 */

import { server } from '@/src/mocks/server';
import 'react-native-gesture-handler/jestSetup';

// MSW 서버 설정
beforeAll(() => {
  // 테스트 시작 전 MSW 서버 시작
  server.listen({
    onUnhandledRequest: 'error', // 테스트에서는 처리되지 않은 요청을 에러로 처리
  });
});

afterEach(() => {
  // 각 테스트 후 핸들러 리셋
  server.resetHandlers();
});

afterAll(() => {
  // 모든 테스트 완료 후 MSW 서버 종료
  server.close();
});

// 콘솔 경고 억제 (필요한 경우)
global.console = {
  ...console,
  // warn: jest.fn(), // 경고 로그 억제
  // error: jest.fn(), // 에러 로그 억제
};