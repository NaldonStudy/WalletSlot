import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Spacing, themes, Typography } from '@/src/constants/theme';

type EditSlotItemProps = {
  icon: any; // require() 또는 URL
  slotName: string;
  budget: number;
  remaining: number;
  onPress?: () => void;      // 선택 동작
};

const EditSlotItem: React.FC<EditSlotItemProps> = ({
  icon,
  slotName,
  budget,
  remaining,
  onPress,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        theme.shadows.base,
        {
          backgroundColor: theme.colors.background.tertiary,
          borderColor: theme.colors.border.light,
          borderWidth: 1,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Image source={icon} style={styles.icon} />
        </View>
        <View style={styles.info}>
          <Text style={styles.slotName}>{slotName}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>총 예산</Text>
            <Text style={styles.value}>{budget.toLocaleString()}원</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>잔여 금액</Text>
            <Text style={styles.value}>{remaining.toLocaleString()}원</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EditSlotItem;

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center', // 아이콘과 정보 영역 높이 기준 맞춤
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  icon: {
    width: 40,
    height: 40,
  },
  info: {
    flex: 1,
  },
  slotName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    color: '#6B7280',
  },
  value: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: '#111827',
  },
});
