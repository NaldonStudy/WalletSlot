import { useSlotDivideStore } from '@/src/store/slotDivideStore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function R6eadyScreen() {
  const { data } = useSlotDivideStore();
  
  // 진행률 상태
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // 스피너 회전 애니메이션
  const spinValue = useState(new Animated.Value(0))[0];
  

  // 진행률 애니메이션 (3초간 0%에서 100%)
  useEffect(() => {
    const duration = 3000; // 3초
    const interval = 50; // 50ms마다 업데이트
    const totalSteps = duration / interval;
    const progressStep = 100 / totalSteps;
    
    let currentStep = 0;
    const progressInterval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(currentStep * progressStep, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(progressInterval);
        setIsLoading(false);
        // 100% 완료 시 바로 a7djustSlot으로 이동
        setTimeout(() => {
          router.push('/(slotDivide)/a7djustSlot' as any);
        }, 500); // 0.5초 후 이동
      }
    }, interval);
    
    return () => clearInterval(progressInterval);
  }, []);

  // 스피너 회전 애니메이션
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spin.start();
    
    return () => spin.stop();
  }, []);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.content}>
          {isLoading ? (
            <>
              <Text style={styles.title}>
                {progress >= 60 ? '거의 다 됐어요!' : '추천 슬롯을 준비하고 있어요.'}
              </Text>
              {progress >= 60 && (
                <Text style={styles.subtitle}>추천을 정리하고 있습니다.</Text>
              )}
              
              {/* 스피너 이미지 */}
              <View style={styles.spinnerContainer}>
                <Animated.Image
                  source={require('@/src/assets/images/loading/spinner.png')}
                  style={[styles.spinner, { transform: [{ rotate: spin }] }]}
                  resizeMode="contain"
                />
              </View>
              
              {/* 진행률 표시 */}
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </>
          ) : null}
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
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111827',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  spinnerContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  spinner: {
    width: 100,
    height: 100,
  },
  progressText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 20,
  },
});
