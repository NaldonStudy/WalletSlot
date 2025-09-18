/**
 * @file index.js
 * @description Firebase 백그라운드 메시지 핸들러를 등록하고 앱을 시작합니다.
 * 이 파일은 앱의 진입점으로, 백그라운드/종료 상태에서의 푸시 알림 처리를 담당합니다.
 */

// Firebase 백그라운드 메시지 핸들러 등록
console.log('[FIREBASE_PUSH] 백그라운드 핸들러 등록 시작...');

// Firebase v23에서 권장하는 방식으로 백그라운드 핸들러 등록
(async function setupFirebaseBackgroundHandler() {
  try {
    // 동적 import로 Firebase messaging 모듈 가져오기
    const FirebaseMessaging = require('@react-native-firebase/messaging');
    
    // Firebase v23에서는 함수로 호출해야 함
    let messaging;
    if (typeof FirebaseMessaging === 'function') {
      messaging = FirebaseMessaging();
      console.log('[FIREBASE_PUSH] Firebase v23: messaging() 함수 호출');
    } else if (FirebaseMessaging.default && typeof FirebaseMessaging.default === 'function') {
      messaging = FirebaseMessaging.default();
      console.log('[FIREBASE_PUSH] Firebase v23: default() 함수 호출');
    } else if (FirebaseMessaging.default) {
      messaging = FirebaseMessaging.default;
      console.log('[FIREBASE_PUSH] Firebase messaging default export 직접 사용');
    } else {
      messaging = FirebaseMessaging;
      console.log('[FIREBASE_PUSH] Firebase messaging 모듈 직접 사용');
    }
    
    // setBackgroundMessageHandler 메서드 확인 및 등록
    if (messaging && messaging.setBackgroundMessageHandler) {
      console.log('[FIREBASE_PUSH] setBackgroundMessageHandler 메서드 발견, 등록 중...');
      
      messaging.setBackgroundMessageHandler(async remoteMessage => {
        console.log('[FIREBASE_PUSH] 🔔 백그라운드 메시지 수신:', remoteMessage);

        // 백그라운드에서 수신한 알림 데이터 처리
        if (remoteMessage?.data) {
          const { type, ...otherData } = remoteMessage.data;
          console.log('[FIREBASE_PUSH] 알림 타입:', type, '추가 데이터:', otherData);
          
          switch (type) {
            case 'budget_exceeded':
              console.log('[FIREBASE_PUSH] 백그라운드: 예산 초과 알림 처리');
              // TODO: AsyncStorage에 예산 초과 정보 저장
              break;
              
            case 'goal_achieved':
              console.log('[FIREBASE_PUSH] 백그라운드: 목표 달성 알림 처리');
              // TODO: AsyncStorage에 목표 달성 정보 저장
              break;
              
            case 'account_sync':
              console.log('[FIREBASE_PUSH] 백그라운드: 계좌 동기화 완료 알림 처리');
              // TODO: 계좌 데이터 캐시 무효화
              break;
              
            default:
              console.log('[FIREBASE_PUSH] 백그라운드: 일반 알림 처리');
          }
        }
        
        // 알림 제목과 내용도 로깅
        if (remoteMessage?.notification) {
          console.log('[FIREBASE_PUSH] 알림 제목:', remoteMessage.notification.title);
          console.log('[FIREBASE_PUSH] 알림 내용:', remoteMessage.notification.body);
        }
      });
      
      console.log('[FIREBASE_PUSH] ✅ 백그라운드 메시지 핸들러 등록 완료');
    } else {
      console.warn('[FIREBASE_PUSH] ⚠️ setBackgroundMessageHandler 메서드를 찾을 수 없습니다.');
      console.warn('[FIREBASE_PUSH] messaging 객체 타입:', typeof messaging);
      if (messaging) {
        console.warn('[FIREBASE_PUSH] messaging 객체 키들:', Object.keys(messaging));
      }
    }
    
  } catch (error) {
    console.error('[FIREBASE_PUSH] ❌ 백그라운드 핸들러 등록 실패:', error);
    console.error('[FIREBASE_PUSH] 에러 상세:', error.message, error.stack);
  }
})();

// 앱의 원래 시작점인 expo-router/entry를 호출합니다.
// 이 코드는 항상 파일의 마지막에 있어야 합니다.
require('expo-router/entry');