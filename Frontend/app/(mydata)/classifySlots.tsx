import { ThemedText } from '@/components/ThemedText';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ClassifySlotsScreen() {
  const [stage, setStage] = useState<'welcome' | 'prompt'>('welcome');

  useEffect(() => {
    const t = setTimeout(() => setStage('prompt'), 3000);
    return () => clearTimeout(t);
  }, []);

  // 아이콘 파티클 애니메이션 (솟았다가 다시 꽂히는 느낌)
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (stage === 'prompt') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 700, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.delay(300),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [stage, bounce]);

  const translateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const scale = bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const opacity = bounce.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

  return (
    <View style={styles.container}>
      {stage === 'welcome' ? (
        <View style={styles.centerBox}>
          <ThemedText style={styles.bigText}>계좌가 성공적으로 연결되었습니다.</ThemedText>
        </View>
      ) : (
        <>
          <ThemedText style={styles.bigText}>계좌의 금액을 슬롯으로 나눠보세요</ThemedText>
          <Animated.Image
            source={require('@/src/assets/images/loading/slotfiles.png')}
            style={[styles.icon, { transform: [{ translateY }, { scale }], opacity }]}
            resizeMode="contain"
          />
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.primary]}>
              <ThemedText style={styles.btnText}>슬롯 나누기</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.secondary]}>
              <ThemedText style={[styles.btnText, styles.secondaryText]}>시작 화면 가기</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 20 },
  centerBox: { alignItems: 'center', justifyContent: 'center' },
  bigText: { fontSize: 18, fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: 18 },
  icon: { width: 160, height: 160, marginVertical: 16 },
  btnRow: { width: '100%', marginTop: 12 },
  btn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  primary: { backgroundColor: '#2383BD' },
  secondary: { backgroundColor: '#E5E7EB' },
  btnText: { color: '#fff', fontWeight: '700' },
  secondaryText: { color: '#111' },
});
