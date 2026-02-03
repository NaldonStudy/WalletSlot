import { Stack } from 'expo-router';

/**
 * 리포트 탭의 스택 네비게이션 레이아웃
 * 
 * 설정:
 * - 헤더 숨김 처리 (각 화면에서 자체 헤더 구현)
 * - 스택 구조로 향후 상세 화면 추가 가능
 */
export default function ReportLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: '리포트',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
