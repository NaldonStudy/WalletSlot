import { Stack } from 'expo-router';

export default function DashboardLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: '대시보드',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="[slotId]" 
        options={{ 
          title: '슬롯 상세',
          presentation: 'modal'
        }} 
      />
    </Stack>
  );
}
