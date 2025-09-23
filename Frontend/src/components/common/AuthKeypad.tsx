import { themes } from '@/src/constants/theme';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

/**
 * 인증 키패드 컴포넌트의 속성 타입
 */
export interface AuthKeypadProps {
  /** 키패드 버튼 클릭 콜백 */
  onDigitPress: (digit: string) => void;
  /** 백스페이스 클릭 콜백 */
  onBackspace?: () => void;
  /** 전체 클리어 클릭 콜백 */
  onClear?: () => void;
  /** 랜덤 셔플 활성화 여부 */
  shuffle?: boolean;
  /** 랜덤 셔플 트리거 (값이 변경될 때마다 다시 셔플) */
  shuffleTrigger?: number | string;
  /** 페이크 터치 보안 기능 활성화 여부 */
  fakeTouch?: boolean;
  /** 애니메이션 활성화 여부 */
  animation?: boolean;
  /** 키패드 크기 조절 */
  size?: 'small' | 'medium' | 'large';
  /** 커스텀 스타일 */
  style?: any;
}

/**
 * 통합 인증 키패드 컴포넌트
 * 
 * @description
 * password-setup.tsx의 고급 보안 기능을 기반으로 한 통합 키패드입니다.
 * 페이크 터치, 애니메이션, 랜덤 셔플 등의 보안 기능을 제공합니다.
 * 
 * @example
 * ```tsx
 * // 기본 키패드 (보안 기능 포함)
 * <AuthKeypad 
 *   onDigitPress={(digit) => handleDigit(digit)}
 *   onBackspace={() => handleBackspace()}
 *   fakeTouch={true}
 *   animation={true}
 * />
 * 
 * // 단순 키패드 (보안 기능 없음)
 * <AuthKeypad 
 *   onDigitPress={(digit) => handleDigit(digit)}
 *   shuffle={true}
 * />
 * ```
 */
export const AuthKeypad: React.FC<AuthKeypadProps> = ({
  onDigitPress,
  onBackspace,
  onClear,
  shuffle = false,
  shuffleTrigger,
  fakeTouch = true,
  animation = true,
  size = 'medium',
  style,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ? themes[colorScheme] : themes.light;
  
  // 상태 관리
  const [keypadNumbers, setKeypadNumbers] = useState<string[]>([]);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  
  // 애니메이션 참조 (12개 버튼용: 숫자 10개 + 특수 버튼 2개)
  const scaleAnimations = useRef<Animated.Value[]>([]);

  // 키패드 숫자 초기화 및 셔플 (항상 랜덤 배치)
  useEffect(() => {
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    // 항상 랜덤 배치 (보안 강화)
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    setKeypadNumbers(shuffled);
    
    // 애니메이션 값 초기화
    scaleAnimations.current = Array(12).fill(0).map(() => new Animated.Value(1));
  }, [shuffleTrigger]); // shuffleTrigger가 변경될 때마다 재실행

  // 크기별 스타일 설정
  const getSizeStyles = () => {
    const sizes = {
      small: { buttonSize: 60, fontSize: 20, gap: 8 },
      medium: { buttonSize: 80, fontSize: 24, gap: 12 },
      large: { buttonSize: 100, fontSize: 28, gap: 16 },
    };
    return sizes[size];
  };

  const sizeStyles = getSizeStyles();

  // 키패드 버튼 애니메이션 (개선된 페이크 터치 효과)
  const animateButtonPress = (index: number) => {
    if (!animation) return;

    const targetAnimation = scaleAnimations.current[index];
    if (!targetAnimation) return;

    // 숫자 버튼인지 확인 (0-9만 페이크 터치 적용)
    const isDigitButton = (index < 9) || (index === 10); // 0-8번 + 10번(마지막 숫자)
    
    // 페이크 터치 효과 - 숫자 버튼에만 적용
    if (fakeTouch && isDigitButton) {
      // 숫자 버튼 인덱스만 선별 (특수 버튼 제외)
      const digitIndices = [];
      for (let i = 0; i < 9; i++) {
        if (i !== index) digitIndices.push(i);
      }
      if (index !== 10) digitIndices.push(10); // 마지막 숫자 버튼
      
      // 1-2개 랜덤 선택
      const shuffled = [...digitIndices].sort(() => Math.random() - 0.5);
      const fakeIndices = shuffled.slice(0, Math.random() > 0.5 ? 1 : 2);
      
      // 실제 버튼과 페이크 버튼들 하이라이트
      const allPressedKeys = [getButtonValue(index)];
      fakeIndices.forEach(fakeIndex => {
        allPressedKeys.push(getButtonValue(fakeIndex));
      });
      
      setPressedKeys(allPressedKeys);
      
      // 모든 버튼 애니메이션을 동일하게 처리 (구분 불가능)
      const animateButton = (buttonIndex: number, delay: number = 0) => {
        const buttonAnimation = scaleAnimations.current[buttonIndex];
        if (buttonAnimation) {
          setTimeout(() => {
            Animated.sequence([
              Animated.timing(buttonAnimation, {
                toValue: 0.85,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(buttonAnimation, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start();
          }, delay);
        }
      };

      // 실제 버튼 애니메이션
      animateButton(index, 0);
      
      // 페이크 버튼들 애니메이션 (약간의 지연으로 자연스럽게)
      fakeIndices.forEach((fakeIndex, i) => {
        animateButton(fakeIndex, Math.random() * 30);
      });

      // 하이라이트 해제
      setTimeout(() => {
        setPressedKeys([]);
      }, 200);
      
    } else {
      // 페이크 터치 없는 일반 애니메이션 (특수 버튼 또는 비활성화 시)
      setPressedKeys([getButtonValue(index)]);
      
      Animated.sequence([
        Animated.timing(targetAnimation, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(targetAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPressedKeys([]);
      });
    }
  };

  // 인덱스에 따른 버튼 값 반환
  const getButtonValue = (index: number): string => {
    if (index < 9) return keypadNumbers[index] || '';
    if (index === 9) return 'X'; // Clear
    if (index === 10) return keypadNumbers[9] || ''; // 마지막 숫자
    if (index === 11) return '←'; // Backspace
    return '';
  };

  // 키패드 버튼 클릭 처리
  const handleKeypadPress = (index: number) => {
    const value = getButtonValue(index);
    
    // 비활성화된 버튼 클릭 차단
    const isDisabled = (index === 9 && !onClear) || (index === 11 && !onBackspace);
    if (isDisabled) {
      return;
    }
    
    // 애니메이션 실행
    if (animation) {
      animateButtonPress(index);
    }

    // 기능 실행
    if (index < 9 || index === 10) {
      // 숫자 버튼 (0-9)
      onDigitPress(value);
    } else if (index === 9) {
      // X 버튼 (전체 클리어)
      onClear?.();
    } else if (index === 11) {
      // ← 버튼 (백스페이스)
      onBackspace?.();
    }
  };

  // 버튼 스타일 생성
  const getButtonStyle = (index: number) => {
    const value = getButtonValue(index);
    const isPressed = pressedKeys.includes(value);
    const isSpecial = index === 9 || index === 11; // X, ← 버튼
    const isDisabled = (index === 9 && !onClear) || (index === 11 && !onBackspace);
    
    return [
      styles.keypadButton,
      {
        width: sizeStyles.buttonSize,
        height: sizeStyles.buttonSize,
        backgroundColor: isPressed 
          ? theme.colors.primary[500]
          : isDisabled
            ? theme.colors.background.tertiary
            : isSpecial 
              ? theme.colors.background.secondary
              : theme.colors.background.primary,
        borderColor: isDisabled 
          ? theme.colors.border.medium 
          : theme.colors.border.light,
        opacity: isDisabled ? 0.6 : 1,
      },
      isPressed && styles.keypadButtonPressed,
    ];
  };

  // 텍스트 스타일 생성
  const getTextStyle = (index: number) => {
    const value = getButtonValue(index);
    const isPressed = pressedKeys.includes(value);
    const isDisabled = (index === 9 && !onClear) || (index === 11 && !onBackspace);
    
    return [
      styles.keypadText,
      {
        fontSize: sizeStyles.fontSize,
        color: isPressed 
          ? theme.colors.text.inverse 
          : isDisabled 
            ? theme.colors.text.tertiary
            : theme.colors.text.primary,
      },
      isPressed && styles.keypadTextPressed,
    ];
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.keypad, { gap: sizeStyles.gap }]}>
        {/* 첫 번째 행 (0, 1, 2) */}
        <View style={[styles.keypadRow, { gap: sizeStyles.gap }]}>
          {[0, 1, 2].map((index) => (
            <TouchableOpacity
              key={`button-${index}`}
              style={getButtonStyle(index)}
              onPress={() => handleKeypadPress(index)}
              activeOpacity={0.7}
              disabled={false}
              accessibilityLabel={`digit_${getButtonValue(index)}`}
            >
              <Animated.View 
                style={{ 
                  transform: [{ 
                    scale: animation ? scaleAnimations.current[index] || 1 : 1 
                  }] 
                }}
              >
                <Text style={getTextStyle(index)}>
                  {getButtonValue(index)}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 두 번째 행 (3, 4, 5) */}
        <View style={[styles.keypadRow, { gap: sizeStyles.gap }]}>
          {[3, 4, 5].map((index) => (
            <TouchableOpacity
              key={`button-${index}`}
              style={getButtonStyle(index)}
              onPress={() => handleKeypadPress(index)}
              activeOpacity={0.7}
              accessibilityLabel={`digit_${getButtonValue(index)}`}
            >
              <Animated.View 
                style={{ 
                  transform: [{ 
                    scale: animation ? scaleAnimations.current[index] || 1 : 1 
                  }] 
                }}
              >
                <Text style={getTextStyle(index)}>
                  {getButtonValue(index)}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 세 번째 행 (6, 7, 8) */}
        <View style={[styles.keypadRow, { gap: sizeStyles.gap }]}>
          {[6, 7, 8].map((index) => (
            <TouchableOpacity
              key={`button-${index}`}
              style={getButtonStyle(index)}
              onPress={() => handleKeypadPress(index)}
              activeOpacity={0.7}
              accessibilityLabel={`digit_${getButtonValue(index)}`}
            >
              <Animated.View 
                style={{ 
                  transform: [{ 
                    scale: animation ? scaleAnimations.current[index] || 1 : 1 
                  }] 
                }}
              >
                <Text style={getTextStyle(index)}>
                  {getButtonValue(index)}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 네 번째 행 (X, 마지막 숫자, ←) */}
        <View style={[styles.keypadRow, { gap: sizeStyles.gap }]}>
          {[9, 10, 11].map((index) => (
            <TouchableOpacity
              key={`button-${index}`}
              style={getButtonStyle(index)}
              onPress={() => handleKeypadPress(index)}
              activeOpacity={0.7}
              disabled={(index === 9 && !onClear) || (index === 11 && !onBackspace)}
              accessibilityLabel={
                index === 9 ? 'clear' : 
                index === 11 ? 'backspace' : 
                `digit_${getButtonValue(index)}`
              }
            >
              <Animated.View 
                style={{ 
                  transform: [{ 
                    scale: animation ? scaleAnimations.current[index] || 1 : 1 
                  }] 
                }}
              >
                <Text style={getTextStyle(index)}>
                  {getButtonValue(index)}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypad: {
    alignItems: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  keypadButton: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keypadButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  keypadText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  keypadTextPressed: {
    fontWeight: '700',
  },
});

export default AuthKeypad;