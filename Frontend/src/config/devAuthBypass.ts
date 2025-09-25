// 개발용 로그인 바이패스 설정
// enabled 를 true로 두면 앱 시작 시 아래 토큰/유저정보로 로그인된 상태부터 진입합니다.
// 주의: 실제 배포 전 반드시 false로 돌려주세요.

export const DEV_AUTH_BYPASS = {
  enabled: true, // 손쉽게 ON/OFF
  // 액세스/리프레시 토큰 (예시 값)
  tokens: {
    accessToken:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidWlkIjoxLCJleHAiOjE3NTg4MzQ5MTMsImlhdCI6MTc1ODc0ODUxMywiZGlkIjoiMTIzNCIsImp0aSI6IjYxNzJiNDFmLWUwMWItNGQzOC1hNThlLWJjZTAxNGExNGQ3YSJ9.Vs6nwnSk3_aNGbYbsN4c-G90vBHOst2t2iRvBzpnRiM',
    refreshToken:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidWlkIjoxLCJ0eXAiOiJyZWZyZXNoIiwiZXhwIjoxNzYxMzQwNTEzLCJpYXQiOjE3NTg3NDg1MTMsImRpZCI6IjEyMzQiLCJqdGkiOiI1NjkzZTFjMi05YTZkLTQ3ZTMtOWI5OS0yODlkN2VmZWU4ZTUifQ.BiVyy7PHN3e5HIdRiuoKvMApMTIvpNYDxJ2_rZZ-hzg',
  },
  // 로컬 사용자 표시 정보 (필수 최소만)
  user: {
    userName: '전해지',
    isPushEnabled: true,
  },
  // 디바이스 ID를 강제로 지정하고 싶다면 설정 (없으면 무시)
  // deviceIdOverride를 지정하지 않으면 기존/생성된 값 사용
  deviceIdOverride: 1234,
} as const;
