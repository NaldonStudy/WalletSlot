import { Stack } from 'expo-router';

export default function TransactionLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "거래 상세 내역",
        }} 
      />
      <Stack.Screen 
        name="splits" 
        options={{ 
          title: "금액 나누기",
        }} 
      />
      <Stack.Screen 
        name="receipt-scan" 
        options={{ 
          title: "영수증 스캔",
        }} 
      />
    </Stack>
  );
}
