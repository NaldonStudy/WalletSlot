import { Stack } from 'expo-router';

export default function OnboardingGroupLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: false,
          gestureEnabled: false, // 뒤로가기 비활성화
        }} 
      />
      {/* 나중에 splash 화면 추가 시 */}
      {/* <Stack.Screen 
        name="splash" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      /> */}
    </Stack>
  );
}
