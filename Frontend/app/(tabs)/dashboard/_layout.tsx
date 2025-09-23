import { Stack } from 'expo-router';

export default function DashboardLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: '대시보드',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="slot/[slotId]"
                options={{ headerShown: false }} // 하위 레이아웃에 맡기기
            />
        </Stack>
    );
}
