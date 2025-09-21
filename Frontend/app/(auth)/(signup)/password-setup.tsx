import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function PasswordSetupScreen() {
  // 상태 관리
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keypadNumbers, setKeypadNumbers] = useState<string[]>([]);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  // 참조
  const buttonRefs = useRef<(TouchableOpacity | null)[]>([]);
  const scaleAnimations = useRef<Animated.Value[]>([]);

  // 6자리 PIN 입력 완료 여부
  const isPinComplete = pin.every(digit => digit !== '');

  // 키패드 숫자 랜덤 생성
  useEffect(() => {
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    setKeypadNumbers(shuffled);
    
    // 애니메이션 값 초기화 (12개 버튼용)
    scaleAnimations.current = Array(12).fill(0).map(() => new Animated.Value(1));
  }, []);

  // PIN 입력 처리
  const handlePinInput = (digit: string) => {
    const emptyIndex = pin.findIndex(digit => digit === '');
    if (emptyIndex !== -1) {
      const newPin = [...pin];
      newPin[emptyIndex] = digit;
      setPin(newPin);
    } else {
      // 6자리 모두 채워진 경우, 마지막 자리부터 교체
      const newPin = [...pin];
      newPin[5] = digit;
      setPin(newPin);
    }
  };

  // 백스페이스 처리
  const handleBackspace = () => {
    const lastFilledIndex = pin.findLastIndex(digit => digit !== '');
    if (lastFilledIndex !== -1) {
      const newPin = [...pin];
      newPin[lastFilledIndex] = '';
      setPin(newPin);
    }
  };

  // 전체 지우기
  const handleClear = () => {
    setPin(['', '', '', '', '', '']);
  };

  // 키패드 버튼 애니메이션 (페이크 터치 효과 포함)
  const animateButtonPress = (index: number) => {
    const animation = scaleAnimations.current[index];
    if (animation) {
      // 페이크 터치 효과 - 정확히 1개만 추가로 선택
      const availableIndices = [];
      for (let i = 0; i < 12; i++) {
        if (i !== index) {
          availableIndices.push(i);
        }
      }
      
      // 1개를 랜덤하게 선택
      const shuffled = [...availableIndices].sort(() => Math.random() - 0.5);
      const fakeIndices = shuffled.slice(0, 1);
      
      // 실제 버튼과 페이크 버튼들 모두 pressedKeys에 추가
      const allPressedKeys = [keypadNumbers[index]];
      fakeIndices.forEach(fakeIndex => {
        if (fakeIndex < 10) { // 숫자 버튼만
          allPressedKeys.push(keypadNumbers[fakeIndex]);
        } else if (fakeIndex === 9) { // X 버튼
          allPressedKeys.push('X');
        } else if (fakeIndex === 11) { // ← 버튼
          allPressedKeys.push('←');
        }
      });
      
      setPressedKeys(allPressedKeys);
      
      // 실제 버튼 애니메이션 (더 강한 효과)
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 0.7,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPressedKeys([]);
      });
      
      // 페이크 터치 애니메이션 (더 명확한 효과)
      fakeIndices.forEach(fakeIndex => {
        const fakeAnimation = scaleAnimations.current[fakeIndex];
        if (fakeAnimation) {
          // 페이크 터치는 약간의 지연을 두고 시작
          setTimeout(() => {
            Animated.sequence([
              Animated.timing(fakeAnimation, {
                toValue: 0.85,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(fakeAnimation, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start();
          }, Math.random() * 50); // 0-50ms 랜덤 지연
        }
      });
    }
  };

  // 키패드 버튼 클릭
  const handleKeypadPress = (digit: string, index: number) => {
    animateButtonPress(index);
    handlePinInput(digit);
  };

  // PIN 설정 완료
  const handlePinComplete = async () => {
    if (!isPinComplete) return;

    setIsLoading(true);
    
    try {
      // Mock PIN 저장 (실제로는 암호화하여 저장)
      const pinString = pin.join('');
      console.log('PIN 설정 완료:', pinString);
      
      // 성공 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('설정 완료', 'PIN이 성공적으로 설정되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            router.replace('/(tabs)/dashboard');
          }
        }
      ]);
    } catch (error) {
      Alert.alert('설정 실패', 'PIN 설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 메인 콘텐츠 */}
        <View style={styles.content}>
          <Text style={styles.title}>Wallet Slot을 안전하게 잠글</Text>
          <Text style={styles.subtitle}>PIN 6자리를 입력해주세요.</Text>

          {/* PIN 입력 표시 */}
          <View style={styles.pinContainer}>
            {pin.map((digit, index) => (
              <View 
                key={index} 
                style={[
                  styles.pinDot,
                  digit ? styles.pinDotFilled : styles.pinDotEmpty
                ]} 
              />
            ))}
          </View>
        </View>

        {/* 커스텀 키패드 */}
        <View style={styles.keypad}>
          {/* 첫 번째 행 */}
          <View style={styles.keypadRow}>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[0] = ref; }}
              style={[
                styles.keypadButton,
                pressedKeys.includes(keypadNumbers[0]) && styles.keypadButtonPressed
              ]}
              onPress={() => handleKeypadPress(keypadNumbers[0], 0)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[0] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes(keypadNumbers[0]) && styles.keypadTextPressed
                ]}>
                  {keypadNumbers[0]}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[1] = ref; }}
              style={[
                styles.keypadButton,
                pressedKeys.includes(keypadNumbers[1]) && styles.keypadButtonPressed
              ]}
              onPress={() => handleKeypadPress(keypadNumbers[1], 1)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[1] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes(keypadNumbers[1]) && styles.keypadTextPressed
                ]}>
                  {keypadNumbers[1]}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[2] = ref; }}
              style={[
                styles.keypadButton,
                pressedKeys.includes(keypadNumbers[2]) && styles.keypadButtonPressed
              ]}
              onPress={() => handleKeypadPress(keypadNumbers[2], 2)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[2] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes(keypadNumbers[2]) && styles.keypadTextPressed
                ]}>
                  {keypadNumbers[2]}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* 두 번째 행 */}
          <View style={styles.keypadRow}>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[3] = ref; }}
              style={[
                styles.keypadButton,
                pressedKeys.includes(keypadNumbers[3]) && styles.keypadButtonPressed
              ]}
              onPress={() => handleKeypadPress(keypadNumbers[3], 3)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[3] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes(keypadNumbers[3]) && styles.keypadTextPressed
                ]}>
                  {keypadNumbers[3]}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[4] = ref; }}
              style={[
                styles.keypadButton,
                pressedKeys.includes(keypadNumbers[4]) && styles.keypadButtonPressed
              ]}
              onPress={() => handleKeypadPress(keypadNumbers[4], 4)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[4] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes(keypadNumbers[4]) && styles.keypadTextPressed
                ]}>
                  {keypadNumbers[4]}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[5] = ref; }}
              style={[
                styles.keypadButton,
                pressedKeys.includes(keypadNumbers[5]) && styles.keypadButtonPressed
              ]}
              onPress={() => handleKeypadPress(keypadNumbers[5], 5)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[5] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes(keypadNumbers[5]) && styles.keypadTextPressed
                ]}>
                  {keypadNumbers[5]}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* 세 번째 행 */}
          <View style={styles.keypadRow}>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[6] = ref; }}
              style={[
                styles.keypadButton,
                pressedKeys.includes(keypadNumbers[6]) && styles.keypadButtonPressed
              ]}
              onPress={() => handleKeypadPress(keypadNumbers[6], 6)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[6] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes(keypadNumbers[6]) && styles.keypadTextPressed
                ]}>
                  {keypadNumbers[6]}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[7] = ref; }}
              style={[
                styles.keypadButton,
                pressedKeys.includes(keypadNumbers[7]) && styles.keypadButtonPressed
              ]}
              onPress={() => handleKeypadPress(keypadNumbers[7], 7)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[7] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes(keypadNumbers[7]) && styles.keypadTextPressed
                ]}>
                  {keypadNumbers[7]}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[8] = ref; }}
              style={[
                styles.keypadButton,
                pressedKeys.includes(keypadNumbers[8]) && styles.keypadButtonPressed
              ]}
              onPress={() => handleKeypadPress(keypadNumbers[8], 8)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[8] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes(keypadNumbers[8]) && styles.keypadTextPressed
                ]}>
                  {keypadNumbers[8]}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* 네 번째 행: X, 마지막 숫자, ← */}
          <View style={styles.keypadRow}>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[9] = ref; }}
              style={[
                styles.keypadButton,
                styles.keypadButtonSpecial,
                pressedKeys.includes('X') && styles.keypadButtonPressed
              ]}
              onPress={() => {
                animateButtonPress(9);
                handleClear();
              }}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[9] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes('X') && styles.keypadTextPressed
                ]}>
                  X
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[10] = ref; }}
              style={[
                styles.keypadButton,
                pressedKeys.includes(keypadNumbers[9]) && styles.keypadButtonPressed
              ]}
              onPress={() => handleKeypadPress(keypadNumbers[9], 10)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[10] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes(keypadNumbers[9]) && styles.keypadTextPressed
                ]}>
                  {keypadNumbers[9]}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity
              ref={(ref) => { buttonRefs.current[11] = ref; }}
              style={[
                styles.keypadButton,
                styles.keypadButtonSpecial,
                pressedKeys.includes('←') && styles.keypadButtonPressed
              ]}
              onPress={() => {
                animateButtonPress(11);
                handleBackspace();
              }}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[11] || 1 }] }}>
                <Text style={[
                  styles.keypadText,
                  pressedKeys.includes('←') && styles.keypadTextPressed
                ]}>
                  ←
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* PIN 완료 시 완료 버튼 표시 */}
        {isPinComplete && (
          <View style={styles.completeButtonContainer}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handlePinComplete}
              disabled={isLoading}
            >
              <Text style={styles.completeButtonText}>
                {isLoading ? '설정 중...' : '완료'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 48,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 48,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  pinDotEmpty: {
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  keypad: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keypadButton: {
    width: (width - 80) / 3,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keypadButtonSpecial: {
    backgroundColor: '#F9FAFB',
  },
  keypadButtonPressed: {
    backgroundColor: '#3B82F6',
    transform: [{ scale: 0.95 }],
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  keypadText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  keypadTextPressed: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  completeButtonContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  completeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
