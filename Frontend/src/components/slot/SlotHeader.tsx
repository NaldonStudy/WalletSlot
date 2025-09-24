import { SlotData } from '@/src/types';
import React from 'react';
import { router } from 'expo-router';
import { View, StyleSheet, useColorScheme, Text } from 'react-native';
import { Spacing, themes } from '@/src/constants';
import { SvgProps } from 'react-native-svg';
import { SLOT_CATEGORIES } from '@/src/constants/slots';

type SlotHeaderProps = {
    slot: SlotData;   // 슬롯 하나만 받음
    variant?: 'large' | 'small';
};

const SlotHeader = ({ slot, variant = 'large' }: SlotHeaderProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];
    
    // SLOT_CATEGORIES에서 아이콘과 색상 가져오기
    const slotIcon = SLOT_CATEGORIES[slot.slotId as keyof typeof SLOT_CATEGORIES]?.icon;
    const slotColor = SLOT_CATEGORIES[slot.slotId as keyof typeof SLOT_CATEGORIES]?.color || '#F1A791';
    const slotName = slot.customName || slot.name;

    return (
        <View
          style={[
            styles.container,
            variant === 'large' ? styles.large : styles.small,
            theme.shadows.base,
            {
              backgroundColor: theme.colors.background.primary,
              borderColor: theme.colors.border.light,
              borderWidth: 1,
            },
          ]}
        >
          {slotIcon && React.createElement(slotIcon, {
            width: variant === 'large' ? 28 : 18,
            height: variant === 'large' ? 28 : 18,
            fill: slotColor,
            color: slotColor,
            style: variant === 'large' ? styles.iconLarge : styles.iconSmall,
          })}
          <Text
            style={[
              variant === 'large' ? styles.nameLarge : styles.nameSmall,
              { color: theme.colors.text.primary },
            ]}
          >
            {slotName}
          </Text>
        </View>
      );
    };

export default SlotHeader;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 9999, // pill 형태
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignSelf: 'flex-start',
    },
    large: {
        margin: Spacing.lg,
    },
    small: {
        margin: Spacing.sm,
    },
    iconLarge: {
        width: 28,
        height: 28,
        marginRight: Spacing.base,
      },
      iconSmall: {
        width: 18,
        height: 18,
        marginRight: Spacing.sm,
      },
      nameLarge: {
        fontSize: 20,
        fontWeight: 'bold',
      },
      nameSmall: {
        fontSize: 14,
      },
});