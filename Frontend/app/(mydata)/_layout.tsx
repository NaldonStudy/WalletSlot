import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyDataLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#fff' }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="account-connect" />
        <Stack.Screen name="account-select" />
        <Stack.Screen name="mydata-consent" />
        <Stack.Screen name="authenticationPin" />
        <Stack.Screen name="bank-select" />
        <Stack.Screen name="classifySlots" />
      </Stack>
    </SafeAreaView>
  );
}
