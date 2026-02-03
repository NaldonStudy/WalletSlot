import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: '프로필',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
