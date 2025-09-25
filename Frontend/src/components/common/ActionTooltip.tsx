// src/components/common/ActionTooltip.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet, useColorScheme } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { themes } from "@/src/constants/theme";

interface ActionTooltipProps {
  onEdit?: () => void;
  onHistory?: () => void;
}

const ActionTooltip = ({ onEdit, onHistory }: ActionTooltipProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  
  return (
    <View 
      style={[styles.container, theme.shadows.base, {
        backgroundColor: theme.colors.background.primary,
        borderColor: theme.colors.border.light,
        borderWidth: 1, 
      }]}
      onTouchStart={(e) => {
        e.stopPropagation(); // 터치 이벤트 전파 중단
      }}
    >
      <Pressable 
        style={styles.item} 
        onPress={() => {
          onEdit?.();
        }}
      >
        <MaterialIcons name="edit" size={22} color={theme.colors.text.primary} />
        <Text style={[styles.text, { color: theme.colors.text.primary }]}>예산 변경</Text>
      </Pressable>
      <Pressable 
        style={styles.item} 
        onPress={() => {
          console.log('[ActionTooltip] 변경 내역 버튼 터치됨');
          onHistory?.();
        }}
      >
        <MaterialIcons name="history" size={22} color={theme.colors.text.primary} />
        <Text style={[styles.text, { color: theme.colors.text.primary }]}>변경 내역</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 120,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 44, // 최소 터치 영역 확보
  },
  text: {
    marginLeft: 8,
    fontSize: 15,
    color: "#1E40AF",
  },
});

export default ActionTooltip;
