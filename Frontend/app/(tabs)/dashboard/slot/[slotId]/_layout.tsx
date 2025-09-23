import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { themes } from '@/src/constants/theme';

export default function SlotLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: '슬롯 상세 내역',
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: '슬롯 예산 변경',   // <- 파일명 대신 이 title이 적용됨
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.background.primary },
          headerTintColor: theme.colors.text.primary,
        }}
      />
      <Stack.Screen
        name="transfer"
        options={{
          title: '예산 변경',
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.background.primary },
          headerTintColor: theme.colors.text.primary,
        }}
      />
    </Stack>
  );
}
