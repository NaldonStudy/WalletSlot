/**
 * 디자인 시스템 - 색상 팔레트
 */
export const Colors = {
  // Primary Colors
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main primary
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary Colors
  secondary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Main secondary
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Gray Scale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Status Colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Slot Category Colors
  slots: {
    food: '#FF6B6B',
    transport: '#4ECDC4',
    shopping: '#45B7D1',
    entertainment: '#96CEB4',
    education: '#FFEAA7',
    healthcare: '#DDA0DD',
    savings: '#98D8C8',
    uncategorized: '#95A5A6',
    other: '#B0B0B0',
  },

  // Background Colors
  background: {
    light: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
    },
    dark: {
      primary: '#111827',
      secondary: '#1F2937',
      tertiary: '#374151',
    }
  },

  // Text Colors
  text: {
    light: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
    dark: {
      primary: '#FFFFFF',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
      inverse: '#111827',
    }
  },

  // Border Colors
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.2)',
  },
} as const;

/**
 * 타이포그래피 시스템
 */
export const Typography = {
  // Font Families
  fontFamily: {
    primary: 'System', // iOS: San Francisco, Android: Roboto
    mono: 'Courier New',
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

/**
 * 간격 시스템
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,
} as const;

/**
 * 보더 반지름
 */
export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

/**
 * 그림자 시스템
 */
export const Shadows = {
  sm: {
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: Colors.shadow.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/**
 * 애니메이션 이징
 */
export const Easing = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
} as const;

/**
 * 브레이크포인트
 */
export const Breakpoints = {
  sm: 375,
  md: 414,
  lg: 768,
  xl: 1024,
} as const;

const lightTheme = {
  colors: {
    ...Colors,
    background: Colors.background.light,
    text: Colors.text.light,
  },
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: {
    ...Shadows,
  },
  easing: Easing,
  breakpoints: Breakpoints,
} as const;

const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: Colors.background.dark,
    text: Colors.text.dark,
  },
} as const;

export type Theme = typeof lightTheme;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
