/*
 * 🎛️ MSW 설정 및 초기화
 * 
 * 앱 전역에서 MSW를 사용하기 위한 설정 파일
 * 환경별 MSW 동작 제어
 */

// React Native URL 폴리필 (MSW 사용을 위해 필수)
import 'react-native-url-polyfill/auto';

// Do not statically import './server' here — it pulls in msw/native at bundle-time and
// can trigger MessageEvent/WebSocket code during app initialization.
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
  // MSW 서버 시작 (동적 import — 앱 번들/렌더링을 차단하지 않음)
  const serverModule = await import('./server');
  serverModule.startMSWServer();

    // 응답 지연 설정 (개발 중 네트워크 지연 시뮬레이션)
    if (finalConfig.delay && finalConfig.delay > 0) {
      console.log(`⏱️ MSW 응답 지연: ${finalConfig.delay}ms`);
    }

    if (finalConfig.logging) {
      console.log('✅ MSW 초기화 완료');

      // MSW 연결 테스트 실행 (비동기로 실행하여 초기화 지연 방지)
      setTimeout(async () => {
        try {
          // 'runBasicTests' 함수 하나만 호출하여 테스트를 위임합니다.
          const { runBasicTests } = await import('./test');
          await runBasicTests(); 
        } catch (error) {
          console.warn('⚠️ MSW 테스트 실행 중 오류 발생:', error);
        }
      }, 1000);
    }

  } catch (error) {
    console.error('❌ MSW 초기화 실패:', error);
    console.warn('⚠️ MSW가 비활성화된 상태로 앱이 계속 실행됩니다');
  }
};

// MSW 종료 함수
// MSW 종료 함수 (동적 호출)
export const shutdownMSW = async () => {
  if (!mswConfig.enabled) return;
  try {
    const serverModule = await import('./server');
    serverModule.stopMSWServer();
  } catch (e) {
    // ignore
  }
};

// MSW 서버 인스턴스 접근 함수 (동적 import 필요 시 사용)
export const getServer = async () => {
  try {
    const m: any = await import('./server');
    // server.ts exposes server via internal getter; try common patterns
    if (typeof m.getServerInstance === 'function') return m.getServerInstance();
    if (m.server) return m.server;
    return null;
  } catch (e) {
    return null;
  }
};

// MSW 활성화 상태 확인 함수
export const isMSWEnabled = (): boolean => {
  return mswConfig.enabled;
};

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