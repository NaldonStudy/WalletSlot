import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ReportScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">리포트</ThemedText>
      <ThemedText>지출 분석 및 차트가 여기에 표시됩니다.</ThemedText>
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
