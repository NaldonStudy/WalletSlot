import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;
const STORAGE_KEYS = {
  attempts: 'login:failedAttempts',
  lockoutEnd: 'login:lockoutEnd',
};

// 지금 로그인 정답 pin 123456으로 고정된 하드 코딩 부분.
// TODO: 서버/보안저장소에서 검증하도록 교체
const EXPECTED_PIN = '123456';

export default function LoginPinScreen() {
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [keypadNumbers, setKeypadNumbers] = useState<string[]>([]);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const scaleAnimations = useRef<Animated.Value[]>([]);

  const isPinComplete = pin.every(digit => digit !== '');

  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(MAX_ATTEMPTS);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // 초기화: 키패드, 애니메이션, 저장된 실패/락아웃 상태 로드
  useEffect(() => {
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    setKeypadNumbers(shuffled);
    scaleAnimations.current = Array(12).fill(0).map(() => new Animated.Value(1));

    (async () => {
      try {
        const [storedAttempts, storedLockoutEnd] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.attempts),
          AsyncStorage.getItem(STORAGE_KEYS.lockoutEnd),
        ]);
        const attemptsNum = storedAttempts ? Number(storedAttempts) : 0;
        setFailedAttempts(attemptsNum);
        setRemainingAttempts(Math.max(0, MAX_ATTEMPTS - attemptsNum));

        const lockoutTs = storedLockoutEnd ? Number(storedLockoutEnd) : null;
        if (lockoutTs && lockoutTs > Date.now()) {
          setLockoutEnd(lockoutTs);
        } else {
          // 만료/없음 초기화
          await AsyncStorage.multiRemove([STORAGE_KEYS.lockoutEnd]);
        }
      } catch {}
    })();
  }, []);

  // 락아웃 카운트다운
  useEffect(() => {
    if (!lockoutEnd) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((lockoutEnd - Date.now()) / 1000));
      setCountdown(left);
      if (left <= 0) {
        setLockoutEnd(null);
        setFailedAttempts(0);
        setRemainingAttempts(MAX_ATTEMPTS);
        AsyncStorage.multiRemove([STORAGE_KEYS.lockoutEnd, STORAGE_KEYS.attempts]).catch(() => {});
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [lockoutEnd]);

  const animateButtonPress = (index: number) => {
    const animation = scaleAnimations.current[index];
    if (!animation) return;

    // 실제 버튼
    Animated.sequence([
      Animated.timing(animation, { toValue: 0.7, duration: 120, useNativeDriver: true }),
      Animated.timing(animation, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start(() => setPressedKeys([]));

    // 페이크 터치 하나
    const available = Array.from({ length: 12 }, (_, i) => i).filter(i => i !== index);
    const fakeIndex = available[Math.floor(Math.random() * available.length)];
    const fakeAnim = scaleAnimations.current[fakeIndex];
    if (fakeAnim) {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(fakeAnim, { toValue: 0.85, duration: 100, useNativeDriver: true }),
          Animated.timing(fakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
      }, Math.random() * 50);
    }

    // pressed 시각 효과
    const pressed: string[] = [];
    if (index < 10) pressed.push(keypadNumbers[index]);
    if (fakeIndex < 10) pressed.push(keypadNumbers[fakeIndex]);
    if (fakeIndex === 9) pressed.push('X');
    if (fakeIndex === 11) pressed.push('←');
    setPressedKeys(pressed);
  };

  const handleDigit = (digit: string, index: number) => {
    if (lockoutEnd) return;
    animateButtonPress(index);
    setError('');
    setPin(prev => {
      const i = prev.findIndex(d => d === '');
      const next = [...prev];
      if (i !== -1) next[i] = digit; else next[5] = digit;
      return next;
    });
  };

  const handleBackspace = () => {
    if (lockoutEnd) return;
    const i = [...pin].findLastIndex(d => d !== '');
    if (i !== -1) {
      const next = [...pin];
      next[i] = '';
      setPin(next);
    }
  };

  const handleClear = () => {
    if (lockoutEnd) return;
    setPin(['', '', '', '', '', '']);
  };

  // 확인 버튼 클릭 시 검증
  const handleConfirm = async () => {
    if (lockoutEnd || !isPinComplete || isLoading) return;
    setIsLoading(true);
    const pinString = pin.join('');

    try {
      if (pinString === EXPECTED_PIN) {
        setFailedAttempts(0);
        setRemainingAttempts(MAX_ATTEMPTS);
        await AsyncStorage.multiRemove([STORAGE_KEYS.attempts, STORAGE_KEYS.lockoutEnd]);
        // TODO: 실제 로그인 후 라우팅
        // router.replace('/(tabs)');
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setRemainingAttempts(Math.max(0, MAX_ATTEMPTS - nextAttempts));
        await AsyncStorage.setItem(STORAGE_KEYS.attempts, String(nextAttempts));
        setError('PIN이 올바르지 않습니다.\n다시 입력해주세요.');
        setPin(['', '', '', '', '', '']);

        if (nextAttempts >= MAX_ATTEMPTS) {
          const end = Date.now() + LOCKOUT_SECONDS * 1000;
          setLockoutEnd(end);
          await AsyncStorage.setItem(STORAGE_KEYS.lockoutEnd, String(end));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 락아웃 화면
  if (lockoutEnd) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerItems]}>
          <Text style={styles.lockoutTitle}>PIN 입력이 5회 틀렸습니다.</Text>
          <Text style={[styles.lockoutTitle, { marginTop: 8 }]}>30초 후 다시 시도해주세요.</Text>
          <View style={{ marginTop: 24, marginBottom: 24 }}>
            {/* 경고 아이콘 대체 이미지 (원한다면 교체) */}
            <Image source={{ uri: 'https://dummyimage.com/160x160/ffd7a1/cc7a00&text=!'}} style={{ width: 160, height: 160, borderRadius: 80 }} />
          </View>
          <Text style={styles.countdown}>{String(countdown).padStart(2, '0')}</Text>
          <Link href="/(auth)/(login)/forgot-password" asChild>
            <Text style={styles.forgotLink}>비밀 번호를 잊어버리셨나요?</Text>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>환영합니다!</Text>
          <Text style={styles.subtitle}>앱을 사용하려면 PIN을 입력해주세요.</Text>

          {/* PIN 표시 */}
          <View style={styles.pinContainer}>
            {pin.map((d, i) => (
              <View key={i} style={[styles.pinDot, d ? styles.pinDotFilled : styles.pinDotEmpty]} />
            ))}
          </View>

          {!!error && (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.errorText}>{error}</Text>
              {failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && (
                <Text style={styles.remainingAttempts}>남은 횟수: {MAX_ATTEMPTS - failedAttempts} 회</Text>
              )}
            </View>
          )}
        </View>

        {/* 키패드 */}
        <View style={styles.keypad}>
          {/* 1행 */}
          <View style={styles.keypadRow}>
            {[0,1,2].map((idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.keypadButton, pressedKeys.includes(keypadNumbers[idx]) && styles.keypadButtonPressed]}
                onPress={() => handleDigit(keypadNumbers[idx], idx)}
                activeOpacity={0.7}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnimations.current[idx] || 1 }] }}>
                  <Text style={[styles.keypadText, pressedKeys.includes(keypadNumbers[idx]) && styles.keypadTextPressed]}>
                    {keypadNumbers[idx]}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 2행 */}
          <View style={styles.keypadRow}>
            {[3,4,5].map((idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.keypadButton, pressedKeys.includes(keypadNumbers[idx]) && styles.keypadButtonPressed]}
                onPress={() => handleDigit(keypadNumbers[idx], idx)}
                activeOpacity={0.7}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnimations.current[idx] || 1 }] }}>
                  <Text style={[styles.keypadText, pressedKeys.includes(keypadNumbers[idx]) && styles.keypadTextPressed]}>
                    {keypadNumbers[idx]}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 3행 */}
          <View style={styles.keypadRow}>
            {[6,7,8].map((idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.keypadButton, pressedKeys.includes(keypadNumbers[idx]) && styles.keypadButtonPressed]}
                onPress={() => handleDigit(keypadNumbers[idx], idx)}
                activeOpacity={0.7}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnimations.current[idx] || 1 }] }}>
                  <Text style={[styles.keypadText, pressedKeys.includes(keypadNumbers[idx]) && styles.keypadTextPressed]}>
                    {keypadNumbers[idx]}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 4행 */}
          <View style={styles.keypadRow}>
            {/* X */}
            <TouchableOpacity
              style={[styles.keypadButton, styles.keypadButtonSpecial, pressedKeys.includes('X') && styles.keypadButtonPressed]}
              onPress={() => { animateButtonPress(9); handleClear(); }}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[9] || 1 }] }}>
                <Text style={[styles.keypadText, pressedKeys.includes('X') && styles.keypadTextPressed]}>X</Text>
              </Animated.View>
            </TouchableOpacity>

            {/* 0 */}
            <TouchableOpacity
              style={[styles.keypadButton, pressedKeys.includes(keypadNumbers[9]) && styles.keypadButtonPressed]}
              onPress={() => handleDigit(keypadNumbers[9], 10)}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[10] || 1 }] }}>
                <Text style={[styles.keypadText, pressedKeys.includes(keypadNumbers[9]) && styles.keypadTextPressed]}>
                  {keypadNumbers[9]}
                </Text>
              </Animated.View>
            </TouchableOpacity>

            {/* ← */}
            <TouchableOpacity
              style={[styles.keypadButton, styles.keypadButtonSpecial, pressedKeys.includes('←') && styles.keypadButtonPressed]}
              onPress={() => { animateButtonPress(11); handleBackspace(); }}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimations.current[11] || 1 }] }}>
                <Text style={[styles.keypadText, pressedKeys.includes('←') && styles.keypadTextPressed]}>←</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* PIN 완료 시 확인 버튼 표시 */}
        {isPinComplete && (
          <View style={styles.completeButtonContainer}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleConfirm}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.completeButtonText}>
                {isLoading ? '확인 중...' : '확인'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Link href="/(auth)/(login)/forgot-password" asChild>
            <Text style={styles.forgotLink}>비밀 번호를 잊어버리셨나요?</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  centerItems: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 36,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
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
  errorText: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  remainingAttempts: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  keypad: {
    backgroundColor: '#FFFFFF',
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 4 },
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  forgotLink: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
  },
  lockoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  countdown: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
});


