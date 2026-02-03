import { Stack } from 'expo-router';

export default function SlotDivideLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="s1electDay" 
        options={{ 
          title: '기준일 선택',
          headerShown: false,
          headerBackTitle: '뒤로'
        }} 
      />
      <Stack.Screen 
        name="l2oading" 
        options={{ 
          title: '슬롯 추천 로딩',
          headerShown: false,
          headerBackTitle: '뒤로'
        }} 
      />
      <Stack.Screen 
        name="p3ermission" 
        options={{ 
          title: '권한 동의',
          headerShown: false,
          headerBackTitle: '뒤로'
        }} 
      />
      <Stack.Screen 
        name="i4nputIncome" 
        options={{ 
          title: '월 수입 입력',
          headerShown: false,
          headerBackTitle: '뒤로'
        }} 
      />
      <Stack.Screen 
        name="i5nputPeriod" 
        options={{ 
          title: '분석 기간 선택',
          headerShown: false,
          headerBackTitle: '뒤로'
        }} 
      />
      <Stack.Screen 
        name="r6eady" 
        options={{ 
          title: '추천 준비 완료',
          headerShown: false,
          headerBackTitle: '뒤로'
        }} 
      />
      <Stack.Screen 
        name="a7djustSlot" 
        options={{ 
          title: '슬롯 조정',
          headerShown: false,
          headerBackTitle: '뒤로'
        }} 
      />
    </Stack>
  );
}
