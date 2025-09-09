import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotificationsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">알림</ThemedText>
      <ThemedText>예산 초과 알림, 목표 달성 알림 등이 여기에 표시됩니다.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
