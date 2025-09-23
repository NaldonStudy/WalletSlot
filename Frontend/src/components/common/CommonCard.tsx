import { Spacing, themes } from '@/src/constants/theme';
import React from 'react';
import { StyleSheet, View, ViewProps, useColorScheme } from 'react-native';

/**
 * 공통 카드 컴포넌트의 속성 타입
 */
export interface CommonCardProps extends ViewProps {
  /** 자식 컴포넌트 */
  children: React.ReactNode;
  /** 카드 변형 타입 */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  /** 카드 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 둥근 모서리 크기 */
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** 패딩 크기 */
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 마진 크기 */
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 그림자 표시 여부 */
  shadow?: boolean;
  /** 커스텀 배경색 (테마 색상보다 우선) */
  backgroundColor?: string;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 앱 전체에서 사용할 수 있는 공통 카드 컴포넌트
 * 
 * @description
 * 다양한 카드 스타일을 통일하기 위한 공통 컴포넌트입니다.
 * 기존의 SettingCard, UncategorizedSlotCard, AccountCard 등을 대체할 수 있습니다.
 * 
 * @example
 * ```tsx
 * // 기본 카드
 * <CommonCard>
 *   <Text>카드 내용</Text>
 * </CommonCard>
 * 
 * // 설정 카드 스타일
 * <CommonCard variant="outlined" size="md" padding="md">
 *   <SettingRow />
 * </CommonCard>
 * 
 * // 슬롯 카드 스타일
 * <CommonCard variant="elevated" size="lg" shadow>
 *   <SlotContent />
 * </CommonCard>
 * ```
 */
export const CommonCard: React.FC<CommonCardProps> = ({
  children,
  variant = 'default',
  size = 'md',
  borderRadius = 'md',
  padding = 'md',
  margin = 'sm',
  shadow = false,
  backgroundColor,
  style,
  testID,
  ...props
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  // 변형별 스타일 계산
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: backgroundColor || theme.colors.background.primary,
          ...theme.shadows.base, // iOS 그림자 포함
          elevation: 4, // Android 그림자
        };
      case 'outlined':
        return {
          backgroundColor: backgroundColor || theme.colors.background.primary,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        };
      case 'filled':
        return {
          backgroundColor: backgroundColor || theme.colors.background.secondary,
        };
      default: // 'default'
        return {
          backgroundColor: backgroundColor || theme.colors.background.primary,
        };
    }
  };

  // 크기별 최소 높이
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { minHeight: 60 };
      case 'lg':
        return { minHeight: 120 };
      default: // 'md'
        return { minHeight: 80 };
    }
  };

  // 둥근 모서리 크기
  const getBorderRadiusValue = () => {
    switch (borderRadius) {
      case 'none':
        return 0;
      case 'sm':
        return 8;
      case 'lg':
        return 16;
      case 'xl':
        return 20;
      default: // 'md'
        return 12;
    }
  };

  // 패딩 크기
  const getPaddingValue = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'xs':
        return Spacing.xs;
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.lg;
      case 'xl':
        return Spacing.xl;
      default: // 'md'
        return Spacing.base;
    }
  };

  // 마진 크기
  const getMarginValue = () => {
    switch (margin) {
      case 'none':
        return 0;
      case 'xs':
        return Spacing.xs;
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.lg;
      case 'xl':
        return Spacing.xl;
      default: // 'md'
        return Spacing.base;
    }
  };

  const cardStyle = [
    styles.card,
    getVariantStyle(),
    getSizeStyle(),
    {
      borderRadius: getBorderRadiusValue(),
      padding: getPaddingValue(),
      marginBottom: getMarginValue(),
    },
    shadow && !variant.includes('elevated') && theme.shadows.base,
    style,
  ];

  return (
    <View style={cardStyle} testID={testID} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden', // 둥근 모서리 적용
    justifyContent: 'center', // 기본 세로 정렬
  },
});

export default CommonCard;