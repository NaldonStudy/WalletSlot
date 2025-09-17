import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function AuthLayout(){
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: {backgroundColor: '#fff'}

                }}
            />
        </SafeAreaView>
    )
}