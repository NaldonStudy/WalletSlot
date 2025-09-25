import { Stack } from 'expo-router';

export default function SlotDivideLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="inputInfo" 
        options={{ 
          title: '슬롯 나누기',
          headerShown: true,
          headerBackTitle: '뒤로'
        }} 
      />
    </Stack>
  );
}
