import { Stack } from 'expo-router';

export default function SignupLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
                name="name" 
                options={{ 
                    animation: 'slide_from_right' // 오른쪽에서 슬라이드
                }} 
            />
            <Stack.Screen 
                name="resident-id" 
                options={{ 
                    animation: 'fade'
                }} 
            />
            <Stack.Screen 
                name="phone" 
                options={{ 
                    animation: 'fade'
                }} 
            />
        </Stack>
    )
}