import { SlotData } from '@/src/types';
import React from 'react';
import { router } from 'expo-router';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Spacing, themes } from '@/src/constants';
import { Image, Text } from 'react-native';

type SlotHeaderProps = {
    slot: SlotData;   // 슬롯 하나만 받음
    variant?: 'large' | 'small';
};

const SlotHeader = ({ slot, variant = 'large' }: SlotHeaderProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];

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
          <Image
            source={slot.slotIcon}
            style={variant === 'large' ? styles.iconLarge : styles.iconSmall}
          />
          <Text
            style={[
              variant === 'large' ? styles.nameLarge : styles.nameSmall,
              { color: theme.colors.text.primary },
            ]}
          >
            {slot.slotName}
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