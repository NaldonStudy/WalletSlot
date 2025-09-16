/*
 * 🎛️ MSW 설정 및 초기화
 * 
 * 앱 전역에서 MSW를 사용하기 위한 설정 파일
 * 환경별 MSW 동작 제어
 */

// React Native URL 폴리필 (MSW 사용을 위해 필수)
import 'react-native-url-polyfill/auto';

import { server, startMSWServer, stopMSWServer } from './server';
import { runBasicTests, showAvailableAPIs, testMSWConnection } from './test';

// MSW 설정 옵션
interface MSWConfig {
  enabled: boolean;
  logging: boolean;
  delay?: number; // 응답 지연 시뮬레이션 (ms)
}

// 환경별 MSW 설정
const mswConfig: MSWConfig = {
  enabled: __DEV__, // 개발 환경에서만 활성화
  logging: __DEV__,
  delay: 0, // 기본값: 지연 없음
};

// MSW 초기화 함수
export const initializeMSW = async (config?: Partial<MSWConfig>) => {
  const finalConfig = { ...mswConfig, ...config };
  
  if (!finalConfig.enabled) {
    console.log('🎭 MSW가 비활성화되어 있습니다');
    return;
  }

  try {
    // MSW 서버 시작
    startMSWServer();
    
    // 응답 지연 설정 (개발 중 네트워크 지연 시뮬레이션)
    if (finalConfig.delay && finalConfig.delay > 0) {
      console.log(`⏱️ MSW 응답 지연: ${finalConfig.delay}ms`);
    }
    
    if (finalConfig.logging) {
      console.log('✅ MSW 초기화 완료');
      
      // MSW 연결 테스트 실행
      setTimeout(async () => {
        const isWorking = await testMSWConnection();
        if (isWorking) {
          await showAvailableAPIs();
        }
      }, 1000); // 1초 후 테스트 실행
    }
    
  } catch (error) {
    console.error('❌ MSW 초기화 실패:', error);
  }
};

// MSW 종료 함수
export const shutdownMSW = () => {
  if (mswConfig.enabled) {
    stopMSWServer();
  }
};

// MSW 서버 인스턴스 export (테스트에서 사용)
export { server };

// 개발 도구용 함수들
export const mswUtils = {
  // 특정 핸들러만 활성화
  enableHandlers: (handlerNames: string[]) => {
    console.log('🔧 핸들러 활성화:', handlerNames);
    // 실제 구현은 handlers/index.ts에서 조건부 import로 처리
  },
  
  // MSW 상태 확인
  getStatus: () => ({
    enabled: mswConfig.enabled,
    logging: mswConfig.logging,
    delay: mswConfig.delay,
  }),
  
  // 실시간 설정 변경
  updateConfig: (newConfig: Partial<MSWConfig>) => {
    Object.assign(mswConfig, newConfig);
    console.log('⚙️ MSW 설정 업데이트:', mswConfig);
  },

  // 테스트 함수들 노출
  test: {
    connection: testMSWConnection,
    basic: runBasicTests,
    showAPIs: showAvailableAPIs
  }
};