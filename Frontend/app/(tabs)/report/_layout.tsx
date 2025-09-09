import { Stack } from 'expo-router';

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
