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
                    animation: 'fade' // 페이드 인/아웃
                }} 
            />
            <Stack.Screen 
                name="phone" 
                options={{ 
                    animation: 'slide_from_bottom' // 아래에서 슬라이드
                }} 
            />
        </Stack>
    )
}