import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          gestureEnabled: false, // 뒤로가기 비활성화
        }} 
      />
    </Stack>
  );
}
