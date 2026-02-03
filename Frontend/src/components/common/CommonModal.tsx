import { themes } from '@/src/constants/theme';
import React, { ReactNode } from 'react';
import {
    Modal,
    ModalProps,
    TouchableOpacity,
    useColorScheme,
    View,
    ViewStyle
} from 'react-native';

/**
 * 공통 모달 컴포넌트의 속성 타입
 */
export interface CommonModalProps extends Omit<ModalProps, 'children'> {
  /** 자식 컴포넌트 */
  children: ReactNode;
  /** 모달 표시 여부 */
  visible: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 모달 위치 타입 */
  position?: 'center' | 'bottom' | 'top' | 'fullscreen';
  /** 애니메이션 타입 */
  animationType?: 'none' | 'slide' | 'fade';
  /** 오버레이 배경 터치로 닫기 가능 여부 */
  closeOnOverlayPress?: boolean;
  /** 뒤로가기 버튼으로 닫기 가능 여부 */
  closeOnBackPress?: boolean;
  /** 커스텀 오버레이 스타일 */
  overlayStyle?: ViewStyle;
  /** 커스텀 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  /** 테스트 ID */
  testID?: string;
}

/**
 * 앱 전체에서 사용할 수 있는 공통 모달 컴포넌트
 * 
 * @description
 * 다양한 모달 패턴을 통일하기 위한 기반 컴포넌트입니다.
 * position prop으로 모달의 위치와 스타일을 결정합니다.
 * 
 * @example
 * ```tsx
 * // 중앙 모달
 * <CommonModal visible={visible} onClose={onClose} position="center">
 *   <Text>모달 내용</Text>
 * </CommonModal>
 * 
 * // 하단 시트
 * <CommonModal visible={visible} onClose={onClose} position="bottom">
 *   <BottomSheetContent />
 * </CommonModal>
 * 
 * // 전체 화면
 * <CommonModal visible={visible} onClose={onClose} position="fullscreen">
 *   <FullScreenContent />
 * </CommonModal>
 * ```
 */
export const CommonModal: React.FC<CommonModalProps> = ({
  children,
  visible,
  onClose,
  position = 'center',
  animationType = 'fade',
  closeOnOverlayPress = true,
  closeOnBackPress = true,
  overlayStyle,
  containerStyle,
  testID = 'common-modal',
  ...modalProps
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  // position에 따른 기본 애니메이션 설정
  const getDefaultAnimation = () => {
    switch (position) {
      case 'bottom':
        return 'slide';
      case 'fullscreen':
        return 'slide';
      case 'center':
      case 'top':
      default:
        return 'fade';
    }
  };

  const finalAnimationType = animationType === 'fade' && position !== 'center' 
    ? getDefaultAnimation() 
    : animationType;

  // position에 따른 컨테이너 스타일
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
    };

    switch (position) {
      case 'center':
        return {
          ...baseStyle,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        };
      case 'bottom':
        return {
          ...baseStyle,
          justifyContent: 'flex-end',
        };
      case 'top':
        return {
          ...baseStyle,
          justifyContent: 'flex-start',
          paddingTop: 60, // 상태바 고려
        };
      case 'fullscreen':
        return {
          ...baseStyle,
        };
      default:
        return baseStyle;
    }
  };

  // 오버레이 스타일
  const getOverlayStyle = (): ViewStyle => {
    if (position === 'fullscreen') {
      return {}; // 전체화면은 오버레이 없음
    }

    return {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    };
  };

  const handleOverlayPress = () => {
    if (closeOnOverlayPress && position !== 'fullscreen') {
      onClose();
    }
  };

  const handleRequestClose = () => {
    if (closeOnBackPress) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={position !== 'fullscreen'}
      animationType={finalAnimationType}
      onRequestClose={handleRequestClose}
      testID={testID}
      {...modalProps}
    >
      {position === 'fullscreen' ? (
        // 전체화면 모달은 오버레이 없이 직접 렌더링
        <View style={[getContainerStyle(), containerStyle]}>
          {children}
        </View>
      ) : (
        // 오버레이가 있는 모달
        <TouchableOpacity
          style={[getContainerStyle(), getOverlayStyle(), overlayStyle]}
          activeOpacity={1}
          onPress={handleOverlayPress}
          testID={`${testID}-overlay`}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()} // 자식 클릭 시 모달 닫기 방지
            style={containerStyle}
          >
            {children}
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </Modal>
  );
};

export default CommonModal;