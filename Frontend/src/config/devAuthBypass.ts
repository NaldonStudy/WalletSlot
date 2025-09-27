// 개발용 로그인 바이패스 설정
// enabled 를 true로 두면 앱 시작 시 아래 토큰/유저정보로 로그인된 상태부터 진입합니다.
// 주의: 실제 배포 전 반드시 false로 돌려주세요.

export const DEV_AUTH_BYPASS = {
  enabled: false, // 손쉽게 ON/OFF
  // 개발용 자유 네비게이션 (임의 경로로 시작)

  // 액세스/리프레시 토큰 (예시 값)
  tokens: {
    accessToken:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyOSIsInVpZCI6MjksImV4cCI6MTc1ODk3ODI3NiwiaWF0IjoxNzU4ODkxODc2LCJkaWQiOiJmN2MyNWQ1MC1mYTc2LTQ4YmYtYmZjOS1mMDY0ODQxMTRkMWYiLCJqdGkiOiIwMTkzYTFmZC0zNGY0LTQ5MzMtYTFkZi0yNWQxMzU4N2M5ZTEifQ.OvFaYQwnNUEMHVP1ikghSjxGtRTSWFbdidoaqMIIlSY',
    refreshToken:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidWlkIjoxLCJ0eXAiOiJyZWZyZXNoIiwiZXhwIjoxNzYxMzUwNzY5LCJpYXQiOjE3NTg3NTg3NjksImRpZCI6IjEyMzQiLCJqdGkiOiJkYzZiYzczNi03YjQwLTQxZjMtOGU0MC00ZjY1MWY2Y2UwNjIifQ.oNnTCKygng2sI1MJfVQI7hiCOVRCHLDMcQWaqmu2s6E',
  },
  // 로컬 사용자 표시 정보 (필수 최소만)
  user: {
    userName: '김싸피',
    isPushEnabled: true,
  },
  // 디바이스 ID를 강제로 지정하고 싶다면 설정 (없으면 무시)
  // deviceIdOverride를 지정하지 않으면 기존/생성된 값 사용
  deviceIdOverride: 'f7c25d50-fa76-48bf-bfc9-f06484114d1f',
  // 마이데이터 연결 상태 테스트용 설정
  // true: 마이데이터 연결 완료 상태로 시작 (메인 앱으로 이동)
  // false: 마이데이터 연결 미완료 상태로 시작 (마이데이터 화면으로 이동)
  myDataConnectEnabled: true
} as const;


