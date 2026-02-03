import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function CustomSplashScreen() {
  const colorScheme = useColorScheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // 애니메이션 시작
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isDark = colorScheme === 'dark';

  return (
    <LinearGradient
      colors={isDark ? ['#0A1624', '#1a2a3a'] : ['#C8F5FF', '#63C5F9', 'rgba(200, 245, 255, 0.15)']}
      locations={[0, 0.55, 1]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        {/* 지갑 아이콘 */}
        <View style={styles.walletContainer}>
          <Image
            source={require('@/src/assets/images/splash/wallet-icon.png')}
            style={styles.walletIcon}
            resizeMode="contain"
          />
        </View>

        {/* 앱 이름 - 화면 바닥에 딱 붙이기 */}
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#2C3E50' }]}>
          Wallet Slot
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  walletContainer: {
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  walletIcon: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
