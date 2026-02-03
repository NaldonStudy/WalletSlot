// app/(dev)/test/index.tsx
import { StyleSheet, ScrollView, View, Text } from "react-native";
import { Link } from "expo-router";

export default function TestHubScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>공통 컴포넌트 테스트 허브</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  list: { width: "100%", gap: 16 },
  link: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
  linkText: { fontSize: 16, fontWeight: "600" },
});
