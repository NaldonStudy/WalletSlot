import { Spacing, Typography, themes } from '@/src/constants/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, useColorScheme } from 'react-native';

/**
 * 로딩 인디케이터 컴포넌트의 속성 타입
 */
export interface LoadingIndicatorProps {
  /** 로딩 인디케이터 크기 */
  size?: 'small' | 'large';
  /** 로딩 텍스트 */
  text?: string;
  /** 로딩 텍스트 표시 여부 */
  showText?: boolean;
  /** 커스텀 색상 (테마 색상보다 우선) */
  color?: string;
  /** 세로 정렬 여부 */
  vertical?: boolean;
  /** 컨테이너 스타일 적용 여부 */
  fullScreen?: boolean;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 통일된 로딩 인디케이터 컴포넌트
 * 
 * @description
 * 앱 전체에서 사용하는 로딩 상태를 일관되게 표시하기 위한 컴포넌트입니다.
 * ActivityIndicator와 로딩 텍스트를 조합하여 다양한 상황에 맞게 사용할 수 있습니다.
 * 
 * @example
 * ```tsx
 * // 기본 로딩 인디케이터
 * <LoadingIndicator />
 * 
 * // 텍스트와 함께
 * <LoadingIndicator text="데이터를 불러오는 중..." />
 * 
 * // 전체 화면 로딩
 * <LoadingIndicator fullScreen text="잠시만 기다려주세요..." />
 * 
 * // 큰 크기 + 세로 정렬
 * <LoadingIndicator size="large" vertical />
 * ```
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large',
  text = '로딩 중...',
  showText = true,
  color,
  vertical = true,
  fullScreen = false,
  testID = 'loading-indicator',
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  
  const indicatorColor = color || theme.colors.primary[500];
  
  const containerStyle = [
    fullScreen ? styles.fullScreenContainer : styles.container,
    vertical ? styles.vertical : styles.horizontal,
  ];

  const renderContent = () => (
    <>
      <ActivityIndicator 
        size={size} 
        color={indicatorColor}
        testID={`${testID}-spinner`}
      />
      {showText && text && (
        <Text 
          style={[
            styles.text,
            { color: theme.colors.text.secondary },
            vertical ? styles.textVertical : styles.textHorizontal,
          ]}
          testID={`${testID}-text`}
        >
          {text}
        </Text>
      )}
    </>
  );

  return (
    <View style={containerStyle} testID={testID}>
      {renderContent()}
    </View>
  );
};

/**
 * 컨테이너가 없는 간단한 로딩 인디케이터
 * 이미 컨테이너가 있는 곳에서 사용
 */
export const SimpleLoadingIndicator: React.FC<Pick<LoadingIndicatorProps, 'size' | 'color' | 'testID'>> = ({
  size = 'small',
  color,
  testID = 'simple-loading-indicator',
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  
  return (
    <ActivityIndicator 
      size={size} 
      color={color || theme.colors.primary[500]}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  vertical: {
    flexDirection: 'column',
  },
  horizontal: {
    flexDirection: 'row',
  },
  text: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  textVertical: {
    marginTop: Spacing.sm,
  },
  textHorizontal: {
    marginLeft: Spacing.sm,
  },
});

export default LoadingIndicator;