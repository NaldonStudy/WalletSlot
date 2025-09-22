/*
 * 🧪 MSW 테스트 유틸리티
 * 
 * MSW가 올바르게 작동하는지 확인하기 위한 테스트 함수들
 */

// MSW 상태 테스트 함수
export const testMSWConnection = async () => {
  try {
    console.log('🧪 MSW 연결 테스트 시작...');
    
    // 1. 기본 헬스체크
    const healthResponse = await fetch('https://api.walletslot.com/api/health');
    const healthData = await healthResponse.json();
    
    if (healthData.status === 'ok') {
      console.log('✅ MSW 헬스체크 성공:', healthData.message);
    } else {
      console.error('❌ MSW 헬스체크 실패');
      return false;
    }
    
    console.log('🎉 MSW가 완전히 작동하고 있습니다!');
    return true;
    
  } catch (error) {
    console.error('❌ MSW 테스트 중 오류 발생:', error);
    return false;
  }
};

// 개발 도구: API 엔드포인트 목록 출력
export const showAvailableAPIs = async () => {
  try {
    const response = await fetch('https://api.walletslot.com/api');
    const data = await response.json();
    
    console.log('📋 사용 가능한 Mock API 엔드포인트:');
    // console.table is not always visible in React Native logs; stringify as fallback
    try {
      console.table?.(data.endpoints);
    } catch (e) {
      // ignore
    }
    try {
      console.log(JSON.stringify(data.endpoints, null, 2));
    } catch (e) {
      console.log(data.endpoints);
    }
    
  } catch (error) {
    console.error('API 목록 조회 실패:', error);
  }
};

// 기본 MSW 연결 테스트 (각 브랜치에서 도메인별 테스트 추가 가능)
export const runBasicTests = async () => {
  console.log('🚀 기본 MSW 테스트 시작...');
  
  const connectionTest = await testMSWConnection();
  
  if (connectionTest) {
    await showAvailableAPIs();
    await testMyDataConnections(); // 새로운 mydata API 테스트 추가
    console.log('🎉 MSW 기본 설정이 완료되었습니다!');
  } else {
    console.warn('⚠️ MSW 연결에 문제가 있습니다.');
  }
  
  return connectionTest;
};

// 알림 목록 테스트: 현재 mock notification 수 확인
export const testNotificationsFetch = async () => {
  try {
    console.log('🔔 알림 목록 테스트 시작...');
    const res = await fetch('/api/notifications');
    const data = await res.json();
    const length = Array.isArray(data?.data) ? data.data.length : (Array.isArray(data) ? data.length : 0);
    console.log(`🔔 알림 목록 응답: items=${length}`, data?._fallback ? '(fallback handler)' : '');
  } catch (e) {
    console.error('알림 목록 테스트 실패:', e);
  }
};

// 연결된 금융사 목록 테스트
export const testMyDataConnections = async () => {
  try {
    console.log('🏦 연결된 금융사 목록 테스트 시작...');
    const res = await fetch('/api/users/me/mydata/connections');
    const data = await res.json();
    console.log('🏦 연결된 금융사 API 응답:', data);
    
    if (data.success && data.data && data.data.connections) {
      console.log(`🏦 연결된 계좌 수: ${data.data.connections.length}`);
      console.log(`🏦 활성 계좌 수: ${data.data.activeCount}`);
    } else {
      console.warn('🏦 연결된 금융사 데이터 구조가 예상과 다릅니다:', data);
    }
  } catch (e) {
    console.error('🏦 연결된 금융사 테스트 실패:', e);
  }
};

// 소비 레포트 테스트 (전체 계좌 통합)
export const testSpendingReport = async () => {
  try {
    console.log('📊 소비 레포트 테스트 시작... (전체 계좌 통합)');
    const res = await fetch(`/api/reports/spending`);
    const data = await res.json();
    console.log('📊 소비 레포트 API 응답:', data);
    
    if (data.success && data.data) {
      console.log('📊 레포트 데이터 구조 확인:');
      console.log('- 기간:', data.data.period);
      console.log('- 예산 비교:', data.data.budgetComparison);
      console.log('- 카테고리 분석 수:', data.data.categoryAnalysis?.length || 0);
      console.log('- 또래 비교:', data.data.peerComparison?.demographicInfo);
      console.log('- 상위 지출 수:', data.data.topSpendingCategories?.length || 0);
      console.log('✅ 소비 레포트 테스트 성공');
    } else {
      console.warn('📊 소비 레포트 데이터 구조가 예상과 다릅니다:', data);
    }
  } catch (e) {
    console.error('📊 소비 레포트 테스트 실패:', e);
  }
};