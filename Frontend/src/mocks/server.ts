/*
 * 🖥️ MSW 서버 설정 (React Native용)
 * 
 * React Native 환경에서 MSW를 사용하기 위한 설정
 * 네트워크 요청을 가로채서 Mock 응답 제공
 */

// React Native에서 MSW 사용을 위한 필수 폴리필
import 'react-native-url-polyfill/auto';

// 전역 객체에 폴리필 적용
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// ReadableStream 폴리필 (React Native에서 누락될 수 있음)
if (typeof global.ReadableStream === 'undefined') {
  try {
    const { ReadableStream } = require('web-streams-polyfill/ponyfill');
    global.ReadableStream = ReadableStream;
  } catch (e) {
    // web-streams-polyfill이 없으면 기본 구현으로 대체
    console.warn('ReadableStream polyfill not available');
  }
}

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