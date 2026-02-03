// app/(dev)/_layout.tsx
import { Stack } from 'expo-router';

export default function DevLayout() {
  return (
    <Stack>
      <Stack.Screen name="test/index" options={{ title: '테스트 허브' }} />
    </Stack>
  );
}