/*
 * 🖥️ MSW 서버 설정 (React Native용)
 * 
 * React Native 환경에서 MSW를 사용하기 위한 설정
 * 네트워크 요청을 가로채서 Mock 응답 제공
 */

/*
 * 🖥️ MSW 서버 설정 (React Native용)
 *
 * React Native 환경에서 MSW를 사용하기 위한 설정
 * 네트워크 요청을 가로채서 Mock 응답 제공
 */

// React Native에서 MSW 사용을 위한 필수 폴리필 (MSW import 전에 먼저 적용)
import 'react-native-url-polyfill/auto';

// fast-text-encoding 폴리필 적용
const { TextEncoder, TextDecoder } = require('fast-text-encoding');

// 전역 객체에 폴리필 적용 (MSW 로드 전에 반드시 적용)
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Event 폴리필 (MSW WebSocket 지원용)
if (typeof global.Event === 'undefined') {
  // @ts-ignore
  global.Event = class Event {
    type: string;
    target: any;
    currentTarget: any;
    constructor(type: string) {
      this.type = type;
    }
  };
}

// MessageEvent 폴리필 (MSW WebSocket 지원용)
if (typeof global.MessageEvent === 'undefined') {
  // @ts-ignore - React Native 환경에서 MessageEvent 폴리필
  global.MessageEvent = class MessageEvent extends global.Event {
    data: any;
    origin: string;
    lastEventId: string;
    source: any;
    ports: any[];

    constructor(type: string, eventInitDict?: any) {
      super(type);
      this.data = eventInitDict?.data;
      this.origin = eventInitDict?.origin || '';
      this.lastEventId = eventInitDict?.lastEventId || '';
      this.source = eventInitDict?.source;
      this.ports = eventInitDict?.ports || [];
    }
  };
}

// WebSocket 폴리필 (MSW가 WebSocket을 찾지 못하는 문제 해결)
if (typeof global.WebSocket === 'undefined') {
  // @ts-ignore - 빈 WebSocket 구현으로 MSW가 에러 없이 로드되도록 함
  global.WebSocket = class WebSocket {
    constructor() {
      throw new Error('WebSocket is not supported in React Native MSW environment');
    }
  };
}

// 폴리필 적용 후 MSW import
import { setupServer } from 'msw/native';
import { handlers } from './handlers';

// MSW 서버 인스턴스 생성
export const server = setupServer(...handlers);

// 개발 환경에서만 로깅 활성화
const isDevMode = __DEV__;

// MSW 서버 시작 함수
export const startMSWServer = () => {
  if (isDevMode) {
    server.listen({
      onUnhandledRequest: 'warn', // 처리되지 않은 요청에 대해 경고
    });
    
    console.log('🎭 MSW 서버가 시작되었습니다');
    console.log('📡 네트워크 요청 모킹이 활성화되었습니다');
  }
};

// MSW 서버 중지 함수
export const stopMSWServer = () => {
  if (isDevMode) {
    server.close();
    console.log('🎭 MSW 서버가 중지되었습니다');
  }
};

// 핸들러 리셋 함수 (테스트에서 유용)
export const resetMSWHandlers = () => {
  if (isDevMode) {
    server.resetHandlers();
    console.log('🔄 MSW 핸들러가 리셋되었습니다');
  }
};