import { Spacing, themes, Typography } from '@/src/constants/theme';
import React, { ReactNode } from 'react';
import { Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { CommonModal, CommonModalProps } from './CommonModal';

const { height: screenHeight } = Dimensions.get('window');

/**
 * 바텀 시트 컴포넌트의 속성 타입
 */
export interface BottomSheetProps extends Omit<CommonModalProps, 'children' | 'position'> {
  /** 바텀 시트 제목 */
  title?: string;
  /** 자식 컴포넌트 */
  children: ReactNode;
  /** 바텀 시트 높이 */
  height?: 'auto' | 'half' | 'full' | number;
  /** 드래그 핸들 표시 여부 */
  showHandle?: boolean;
  /** 헤더 표시 여부 */
  showHeader?: boolean;
  /** 닫기 버튼 표시 여부 */
  showCloseButton?: boolean;
  /** 커스텀 헤더 컴포넌트 */
  header?: ReactNode;
}

/**
 * 바텀 시트 컴포넌트
 * 
 * @description
 * phone.tsx의 바텀 시트 스타일을 기반으로 한 표준 바텀 시트입니다.
 * 모바일에 최적화된 UX를 제공합니다.
 * 
 * @example
 * ```tsx
 * // 기본 바텀 시트
 * <BottomSheet 
 *   visible={visible}
 *   onClose={onClose}
 *   title="옵션 선택"
 *   height="half"
 * >
 *   <OptionList />
 * </BottomSheet>
 * 
 * // 커스텀 헤더
 * <BottomSheet
 *   visible={visible}
 *   onClose={onClose}
 *   header={<CustomHeader />}
 * >
 *   <Content />
 * </BottomSheet>
 * ```
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  height = 'auto',
  showHandle = true,
  showHeader = true,
  showCloseButton = true,
  header,
  testID = 'bottom-sheet',
  ...modalProps
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  // 높이 계산 - 항상 확장된 상태 유지
  const getHeightStyle = () => {
    return { height: screenHeight * 0.9 };
  };

  // 드래그 제스처 핸들러
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      // 드래그 중 아무것도 하지 않음 (시각적 피드백 없음)
    },
    onPanResponderRelease: (evt, gestureState) => {
      // 아래로 100px 이상 드래그하면 모달 닫기
      if (gestureState.dy > 100) {
        onClose();
      }
    },
  });

  const renderHeader = () => {
    if (!showHeader && !header) return null;

    if (header) {
      return (
        <View style={styles.headerContainer}>
          {header}
        </View>
      );
    }

    return (
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          {title && (
            <Text style={[
              styles.title,
              { color: theme.colors.text.primary }
            ]}>
              {title}
            </Text>
          )}
          {showCloseButton && (
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              testID={`${testID}-close`}
            >
              <Text style={[
                styles.closeButtonText,
                { color: theme.colors.text.secondary }
              ]}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <CommonModal
      visible={visible}
      onClose={onClose}
      position="bottom"
      animationType="slide"
      testID={testID}
      {...modalProps}
    >
      <View style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
        getHeightStyle()
      ]}>
        {/* 드래그 핸들 */}
        {showHandle && (
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={[
              styles.handle,
              { backgroundColor: theme.colors.border.light }
            ]} />
          </View>
        )}

        {/* 헤더 */}
        {renderHeader()}

        {/* 컨텐츠 */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </CommonModal>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  halfHeight: {
    maxHeight: 500,
    minHeight: 300,
  },
  fullHeight: {
    maxHeight: 700,
    minHeight: 500,
  },
  autoHeight: {
    maxHeight: 600,
    minHeight: 200,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    minHeight: 56,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: Spacing.base,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  handleHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default BottomSheet;