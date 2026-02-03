import { BorderRadius, Shadows, Spacing, themes, Typography } from '@/src/constants/theme';
import React from 'react';
import {
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    useColorScheme,
    ViewStyle,
} from 'react-native';
import { SimpleLoadingIndicator } from './common/LoadingIndicator';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** 버튼 텍스트 */
  title: string;
  /** 버튼 변형 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** 버튼 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 로딩 상태 */
  loading?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 전체 너비 사용 */
  fullWidth?: boolean;
  /** 커스텀 스타일 */
  style?: ViewStyle;
  /** 텍스트 스타일 */
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  const isDisabled = disabled || loading;

  const handlePress = (event: any) => {
    if (isDisabled) return;
    onPress?.(event);
  };

  const getTextColor = (variant: string): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return theme.colors.text.inverse;
      case 'secondary':
        return theme.colors.text.primary;
      case 'outline':
      case 'ghost':
        return theme.colors.primary[500];
      default:
        return theme.colors.text.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getVariantStyle(variant, theme),
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={isDisabled ? 1 : 0.7}
      {...props}
    >
      {loading ? (
        <SimpleLoadingIndicator
          size="small"
          color={getTextColor(variant)}
        />
      ) : (
        <Text
          style={[
            styles.text,
            getTextStyle(variant, theme),
            styles[`${size}Text`],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const getVariantStyle = (variant: string, theme: any) => {
  switch (variant) {
    case 'primary':
      return { backgroundColor: theme.colors.primary[500] };
    case 'secondary':
      return { backgroundColor: theme.colors.gray[100] };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary[500],
      };
    case 'ghost':
      return { backgroundColor: 'transparent' };
    case 'danger':
      return { backgroundColor: theme.colors.error };
    default:
      return { backgroundColor: theme.colors.primary[500] };
  }
};

const getTextStyle = (variant: string, theme: any) => {
  switch (variant) {
    case 'primary':
      return { color: theme.colors.text.inverse };
    case 'secondary':
      return { color: theme.colors.text.primary };
    case 'outline':
      return { color: theme.colors.primary[500] };
    case 'ghost':
      return { color: theme.colors.primary[500] };
    case 'danger':
      return { color: theme.colors.text.inverse };
    default:
      return { color: theme.colors.text.primary };
  }
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.base,
    ...Shadows.sm,
  },

  // Sizes
  sm: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 52,
  },

  // Text styles
  text: {
    fontFamily: Typography.fontFamily.primary,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },

  // Size text styles
  smText: {
    fontSize: Typography.fontSize.sm,
  },
  mdText: {
    fontSize: Typography.fontSize.base,
  },
  lgText: {
    fontSize: Typography.fontSize.lg,
  },

  // States
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});
