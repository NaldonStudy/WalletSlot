import { Stack } from 'expo-router';

export default function WishlistLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: '위시리스트',
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
