import { Spacing, themes, Typography } from '@/src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { AuthKeypad } from './AuthKeypad';

/**
 * PIN 입력 화면 컴포넌트의 속성 타입
 */
export interface AuthPinEntryProps {
  /** 화면 제목 */
  title?: string;
  /** 부제목/설명 */
  subtitle?: string;
  /** PIN 길이 */
  length?: number;
  /** 현재 입력된 값 */
  value?: string;
  /** 뒤로가기 버튼 표시 여부 */
  showBack?: boolean;
  /** 뒤로가기 버튼 클릭 콜백 */
  onBack?: () => void;
  /** 닫기 버튼 클릭 콜백 */
  onClose?: () => void;
  /** 숫자 입력 콜백 */
  onDigitPress: (digit: string) => void;
  /** 백스페이스 클릭 콜백 */
  onDelete?: () => void;
  /** 전체 지우기 클릭 콜백 */
  onClear?: () => void;
  /** 비밀번호 찾기 클릭 콜백 */
  onForgot?: () => void;
  /** 키패드 보안 기능 설정 */
  keypadConfig?: {
    shuffle?: boolean;
    fakeTouch?: boolean;
    animation?: boolean;
    size?: 'small' | 'medium' | 'large';
  };
}

/**
 * 통합 PIN 입력 화면 컴포넌트
 * 
 * @description
 * 새로운 AuthKeypad를 사용하는 전체 화면 PIN 입력 컴포넌트입니다.
 * 기존 PinEntry.tsx를 대체하며 향상된 보안 기능을 제공합니다.
 * 
 * @example
 * ```tsx
 * // 기본 PIN 입력 (보안 기능 포함)
 * <AuthPinEntry
 *   title="비밀번호 입력"
 *   subtitle="6자리 PIN을 입력해주세요"
 *   length={6}
 *   value={pin}
 *   onDigitPress={(digit) => setPin(prev => prev + digit)}
 *   onDelete={() => setPin(prev => prev.slice(0, -1))}
 *   onClose={() => navigation.goBack()}
 * />
 * 
 * // 커스텀 키패드 설정
 * <AuthPinEntry
 *   title="PIN 설정"
 *   keypadConfig={{
 *     fakeTouch: true,
 *     animation: true,
 *     size: 'large'
 *   }}
 *   onDigitPress={handleDigit}
 * />
 * ```
 */
export const AuthPinEntry: React.FC<AuthPinEntryProps> = ({
  title = '비밀번호 입력',
  subtitle,
  length = 6,
  value = '',
  showBack = false,
  onBack,
  onClose,
  onDigitPress,
  onDelete,
  onClear,
  onForgot,
  keypadConfig = {
    shuffle: false,
    fakeTouch: true,
    animation: true,
    size: 'medium',
  },
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme ? themes[colorScheme] : themes.light;
  
  // 키패드 랜덤 배치를 위한 트리거 (컴포넌트 마운트 시마다 새로운 값 생성)
  const [shuffleTrigger] = React.useState(() => Math.random());

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border.light }]}>
        {showBack ? (
          <TouchableOpacity 
            onPress={onBack} 
            style={styles.headerLeft} 
            accessibilityLabel="뒤로"
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerLeft} />
        )}

        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {title}
        </Text>

        <TouchableOpacity 
          onPress={onClose} 
          style={styles.headerRight} 
          accessibilityLabel="닫기"
        >
          <Ionicons name="close" size={22} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* 상단 콘텐츠 */}
      <View style={styles.bodyTop}>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.text.primary }]}>
            {subtitle}
          </Text>
        )}

        <View style={{ height: 28 }} />

        {/* PIN 도트 표시 */}
        <View style={styles.dotsRow}>
          {Array.from({ length }).map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.dot,
                i < value.length 
                  ? [styles.dotFilled, { backgroundColor: theme.colors.text.primary }]
                  : [styles.dotEmpty, { backgroundColor: theme.colors.background.secondary }]
              ]} 
            />
          ))}
        </View>
      </View>

      {/* 하단 키패드 */}
      <View style={styles.bodyBottom}>
        <View style={styles.keypadWrap}>
          <AuthKeypad
            onDigitPress={onDigitPress}
            onBackspace={onDelete}
            onClear={onClear}
            shuffle={keypadConfig.shuffle}
            shuffleTrigger={shuffleTrigger}
            fakeTouch={keypadConfig.fakeTouch}
            animation={keypadConfig.animation}
            size={keypadConfig.size}
          />
        </View>

        {onForgot && (
          <TouchableOpacity 
            onPress={onForgot} 
            style={styles.forgotWrap} 
            accessibilityLabel="비밀번호 찾기"
          >
            <Text style={[styles.forgotText, { color: theme.colors.text.secondary }]}>
              비밀번호를 잊어버리셨나요?
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: { 
    paddingTop: Spacing.base, 
    paddingBottom: Spacing.sm, 
    borderBottomWidth: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative',
  },
  headerLeft: { 
    position: 'absolute', 
    left: Spacing.base, 
    width: 36, 
    alignItems: 'flex-start',
  },
  headerRight: { 
    position: 'absolute', 
    right: Spacing.base, 
    width: 36, 
    alignItems: 'flex-end',
  },
  title: { 
    fontSize: Typography.fontSize.lg, 
    fontWeight: Typography.fontWeight.bold,
  },
  bodyTop: { 
    flex: 1, 
    paddingHorizontal: Spacing.lg, 
    paddingTop: 60, 
    alignItems: 'center', 
    justifyContent: 'flex-start',
  },
  bodyBottom: { 
    alignItems: 'center', 
    paddingBottom: 50, 
    paddingHorizontal: Spacing.lg,
  },
  keypadWrap: { 
    width: '100%', 
    maxWidth: 320, 
    alignItems: 'center',
  },
  subtitle: { 
    fontSize: Typography.fontSize.base, 
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  dotsRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 40, 
    marginBottom: 40,
  },
  dot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    margin: 6,
  },
  dotFilled: {},
  dotEmpty: {},
  forgotWrap: { 
    marginTop: Spacing.sm,
  },
  forgotText: { 
    fontSize: Typography.fontSize.sm,
  },
});

export default AuthPinEntry;