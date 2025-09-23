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
    <View style={[styles.container, theme.shadows.base, {
      backgroundColor: theme.colors.background.primary,
      borderColor: theme.colors.border.light,
      borderWidth: 1, 
    }]}>
      <Pressable style={styles.item} onPress={onEdit}>
        <MaterialIcons name="edit" size={18} color={theme.colors.text.primary} />
        <Text style={[styles.text, { color: theme.colors.text.primary }]}>예산 변경</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={onHistory}>
        <MaterialIcons name="history" size={18} color={theme.colors.text.primary} />
        <Text style={[styles.text, { color: theme.colors.text.primary }]}>변경 내역</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 90,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 3,
  },
  text: {
    marginLeft: 5,
    fontSize: 13,
    color: "#1E40AF",
  },
});

export default ActionTooltip;
