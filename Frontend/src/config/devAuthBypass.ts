// 개발용 로그인 바이패스 설정
// enabled 를 true로 두면 앱 시작 시 아래 토큰/유저정보로 로그인된 상태부터 진입합니다.
// 주의: 실제 배포 전 반드시 false로 돌려주세요.

export const DEV_AUTH_BYPASS = {
  enabled: false, // 손쉽게 ON/OFF
  // 액세스/리프레시 토큰 (예시 값)
  tokens: {
    accessToken:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidWlkIjoxLCJleHAiOjE3NTg4NDUxNjksImlhdCI6MTc1ODc1ODc2OSwiZGlkIjoiMTIzNCIsImp0aSI6ImVkM2NiYzEwLWU4ZjgtNGUyYS05MmRmLTcwNWMyZWY3M2Q5MSJ9.kr17M0hEAuOVOLZJuKBabyBfyk0wnlbXEqZd6iFjLwQ',
    refreshToken:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidWlkIjoxLCJ0eXAiOiJyZWZyZXNoIiwiZXhwIjoxNzYxMzUwNzY5LCJpYXQiOjE3NTg3NTg3NjksImRpZCI6IjEyMzQiLCJqdGkiOiJkYzZiYzczNi03YjQwLTQxZjMtOGU0MC00ZjY1MWY2Y2UwNjIifQ.oNnTCKygng2sI1MJfVQI7hiCOVRCHLDMcQWaqmu2s6E',
  },
  // 로컬 사용자 표시 정보 (필수 최소만)
  user: {
    userName: '전해지',
    isPushEnabled: true,
  },
  // 디바이스 ID를 강제로 지정하고 싶다면 설정 (없으면 무시)
  // deviceIdOverride를 지정하지 않으면 기존/생성된 값 사용
  deviceIdOverride: '1234',
} as const;
