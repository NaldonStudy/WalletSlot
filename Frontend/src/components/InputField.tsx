import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import { themes, Typography, Spacing, BorderRadius } from '../constants/theme';

export interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  /** 라벨 텍스트 */
  label?: string;
  /** 에러 메시지 */
  error?: string;
  /** 도움말 텍스트 */
  helperText?: string;
  /** 필수 입력 여부 */
  required?: boolean;
  /** 입력 필드 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 좌측 아이콘/컴포넌트 */
  leftElement?: React.ReactNode;
  /** 우측 아이콘/컴포넌트 */
  rightElement?: React.ReactNode;
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  /** 입력 필드 스타일 */
  inputStyle?: TextStyle;
  /** 라벨 스타일 */
  labelStyle?: TextStyle;
}

export const InputField = forwardRef<TextInput, InputFieldProps>(({
  label,
  error,
  helperText,
  required = false,
  size = 'md',
  disabled = false,
  leftElement,
  rightElement,
  containerStyle,
  inputStyle,
  labelStyle,
  value,
  onChangeText,
  ...props
}, ref) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, styles[`${size}Label`], { color: theme.colors.text.primary }, labelStyle]}>
          {label}
          {required && <Text style={[styles.required, { color: theme.colors.error }]}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.border.light,
          },
          styles[size],
          isFocused && { borderColor: theme.colors.primary[500], borderWidth: 2 },
          hasError && { borderColor: theme.colors.error },
          disabled && {
            backgroundColor: theme.colors.gray[50],
            borderColor: theme.colors.gray[200],
          },
        ]}
      >
        {leftElement && (
          <View style={styles.leftElement}>
            {leftElement}
          </View>
        )}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            { color: theme.colors.text.primary },
            styles[`${size}Input`],
            leftElement ? styles.inputWithLeftElement : undefined,
            rightElement ? styles.inputWithRightElement : undefined,
            disabled && { color: theme.colors.gray[400] },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          placeholderTextColor={theme.colors.text.tertiary}
          {...props}
        />

        {rightElement && (
          <TouchableOpacity style={styles.rightElement}>
            {rightElement}
          </TouchableOpacity>
        )}
      </View>

      {/* Helper Text or Error */}
      {(error || helperText) && (
        <Text
          style={[
            styles.helperText,
            hasError 
              ? { color: theme.colors.error }
              : { color: theme.colors.text.secondary },
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

InputField.displayName = 'InputField';

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },

  // Label styles
  label: {
    fontFamily: Typography.fontFamily.primary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  smLabel: {
    fontSize: Typography.fontSize.sm,
  },
  mdLabel: {
    fontSize: Typography.fontSize.base,
  },
  lgLabel: {
    fontSize: Typography.fontSize.lg,
  },
  required: {
    // Color will be set inline with theme
  },

  // Input container styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.base,
  },
  sm: {
    minHeight: 36,
    paddingHorizontal: Spacing.sm,
  },
  md: {
    minHeight: 44,
    paddingHorizontal: Spacing.base,
  },
  lg: {
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
  },

  // Input styles
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.primary,
    padding: 0,
  },
  smInput: {
    fontSize: Typography.fontSize.sm,
  },
  mdInput: {
    fontSize: Typography.fontSize.base,
  },
  lgInput: {
    fontSize: Typography.fontSize.lg,
  },
  inputWithLeftElement: {
    marginLeft: Spacing.sm,
  },
  inputWithRightElement: {
    marginRight: Spacing.sm,
  },

  // Element styles
  leftElement: {
    marginRight: Spacing.xs,
  },
  rightElement: {
    marginLeft: Spacing.xs,
    padding: Spacing.xs,
  },

  // Helper text styles
  helperText: {
    fontFamily: Typography.fontFamily.primary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
});
