// src/mocks/server.ts
import { setupServer } from 'msw/native';
import { handlers } from './handlers';

// MSW 서버 인스턴스를 생성합니다.
export const server = setupServer(...handlers);

/**
 * MSW 서버를 시작하는 함수.
 * server.listen()을 감싸서 추상화 계층을 제공합니다.
 */
export const startMSWServer = () => {
  // onUnhandledRequest: 'warn' 옵션은 mock 처리되지 않은 요청에 대해
  // 에러 대신 콘솔에 경고를 출력해줘서 디버깅에 유용합니다.
  server.listen({ onUnhandledRequest: 'warn' });
};

/**
 * MSW 서버를 중지하는 함수.
 */
export const stopMSWServer = () => {
  server.close();
};

/**
 * (선택사항) 서버 인스턴스에 직접 접근해야 할 경우를 위한 함수
 */
export const getServerInstance = () => server;