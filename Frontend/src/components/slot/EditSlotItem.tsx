import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import { SvgProps } from 'react-native-svg';

type EditSlotItemProps = {
  icon?: React.ComponentType<SvgProps>; // SVG 컴포넌트
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
          {icon && React.createElement(icon, {
            width: 40,
            height: 40,
            fill: '#F1A791',
            color: '#F1A791',
          })}
        </View>
        <View style={styles.info}>
          <Text style={styles.slotName}>{slotName}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>총 예산</Text>
            <Text style={styles.value}>{(budget ?? 0).toLocaleString()}원</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>잔여 금액</Text>
            <Text style={styles.value}>{(remaining ?? 0).toLocaleString()}원</Text>
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
