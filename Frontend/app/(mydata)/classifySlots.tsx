import { ThemedText } from '@/components/ThemedText';
import { featureFlags } from '@/src/config/featureFlags';
import { useLocalUserStore } from '@/src/store/localUserStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ClassifySlotsScreen() {
  const router = useRouter();
  const [stage, setStage] = useState<'welcome' | 'prompt'>('welcome');
  const { user } = useLocalUserStore();
  const localUserName = user?.userName || '사용자';

  useEffect(() => {
    if (stage !== 'welcome') return;
    const t = setTimeout(() => setStage('prompt'), 3000);
    return () => clearTimeout(t);
  }, [stage]);

  // 각 슬롯별 애니메이션 값들 (zIndex 순서: 5→4→3→2)
  const firstSlotAnim = useRef(new Animated.Value(0)).current;  // zIndex: 5
  const secondSlotAnim = useRef(new Animated.Value(0)).current; // zIndex: 4
  const thirdSlotAnim = useRef(new Animated.Value(0)).current;  // zIndex: 3
  const finalSlotAnim = useRef(new Animated.Value(0)).current;  // zIndex: 2

  // 축하 배경 애니메이션 (폭죽 터지는 효과)
  const congratulationScale = useRef(new Animated.Value(0.1)).current;

  // 축하 배경 애니메이션 (welcome 단계에서만)
  useEffect(() => {
    if (stage !== 'welcome') return;
    console.log('🎆 [CONGRATULATION] 폭죽 애니메이션 시작');
    congratulationScale.setValue(0.1);
    Animated.timing(congratulationScale, {
      toValue: 1.8, // 더 크게 확대
      duration: 1500, // 3초 → 1.5초로 더 빠르게
      easing: Easing.out(Easing.back(1.2)), // 더 역동적인 이징
      useNativeDriver: true,
    }).start(() => {
      console.log('🎆 [CONGRATULATION] 폭죽 애니메이션 완료');
    });
  }, [stage, congratulationScale]);

  useEffect(() => {
    if (stage === 'prompt') {
      // 각 슬롯의 개별 애니메이션 루프 (진짜로 겹치도록)
      const createSlotAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 500,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 500,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.delay(2000), // 다음 사이클까지 대기 (2초)
          ])
        );
      };

      // 각 슬롯을 독립적으로 시작 (겹치도록 지연)
      const firstSlotLoop = createSlotAnimation(firstSlotAnim, 0);     // 즉시 시작
      const secondSlotLoop = createSlotAnimation(secondSlotAnim, 650); // 0.65초 후 시작
      const thirdSlotLoop = createSlotAnimation(thirdSlotAnim, 1300);  // 1.3초 후 시작
      const finalSlotLoop = createSlotAnimation(finalSlotAnim, 1950);  // 1.95초 후 시작

      firstSlotLoop.start();
      secondSlotLoop.start();
      thirdSlotLoop.start();
      finalSlotLoop.start();

      return () => {
        firstSlotLoop.stop();
        secondSlotLoop.stop();
        thirdSlotLoop.stop();
        finalSlotLoop.stop();
      };
    }
  }, [stage, firstSlotAnim, secondSlotAnim, thirdSlotAnim, finalSlotAnim]);

  // 각 슬롯의 변환 값들 (위로 올라가기)
  const firstSlotTranslateY = firstSlotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const secondSlotTranslateY = secondSlotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const thirdSlotTranslateY = thirdSlotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const finalSlotTranslateY = finalSlotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });


  return (
    <View style={styles.container}>
      {stage === 'welcome' ? (
        <View style={styles.centerBox}>
          {/* 축하 배경 이미지 (폭죽 터지는 효과) */}
          <Animated.Image
            source={require('@/src/assets/images/backgroundstyle/congratulation.png')}
            style={[
              styles.congratulationBackground,
              {
                transform: [{ scale: congratulationScale }],
              },
            ]}
            resizeMode="contain"
          />
          <ThemedText style={styles.bigText}>
            {localUserName}님의 계좌가 성공적으로 연결되었습니다.
          </ThemedText>
        </View>
      ) : (
        <>
          <ThemedText style={styles.bigText}>계좌의 금액을 슬롯으로 나눠보세요</ThemedText>
          
          {/* 슬롯 파일들 (slotfiles.png)와 finalslot.png */}
          <View style={styles.slotContainer}>
            {/* circleEllipsback.png - 맨 밑 배경 레이어 */}
            <Animated.Image
              source={require('@/src/assets/images/backgroundstyle/circleEllipsback.png')}
              style={styles.circleEllipsbackImage}
              resizeMode="contain"
            />
            
            {/* 배경 슬롯 파일들 */}
            {/*
            <Animated.Image
              source={require('@/src/assets/images/loading/slotfiles.png')}
              style={styles.slotFilesImage}
              resizeMode="contain"
            />
            */}
            {/* finalslot.png - 위에 올리기 (zIndex: 2) */}
            <Animated.Image
              source={require('@/src/assets/images/loading/finalslot.png')}
              style={[
                styles.finalSlotImage,
                {
                  transform: [{ translateY: finalSlotTranslateY }]
                }
              ]}
              resizeMode="contain"
            />

            {/* secondslot.png - 위에 올리기 (zIndex: 4) */}
            <Animated.Image
              source={require('@/src/assets/images/loading/secondslot.png')}
              style={[
                styles.secondSlotImage,
                {
                  transform: [
                    { translateY: secondSlotTranslateY },
                    { rotate: '5deg' }
                  ]
                }
              ]}
              resizeMode="contain"
            />

            
            {/* thirdslot.png - slotfiles.png와 같은 위치에 레이어 (zIndex: 3) */}
            <Animated.Image
              source={require('@/src/assets/images/loading/thirdslot.png')}
              style={[
                styles.thirdSlotImage,
                {
                  transform: [{ translateY: thirdSlotTranslateY }]
                }
              ]}
              resizeMode="contain"
            />

            
            {/* firstslot.png - slotfiles.png 위에 올리기 (zIndex: 5) */}
            <Animated.Image
              source={require('@/src/assets/images/loading/firstslot.png')}
              style={[
                styles.firstSlotImage,
                {
                  transform: [{ translateY: firstSlotTranslateY }]
                }
              ]}
              resizeMode="contain"
            />
            
            {/* frontground.png - 맨 위에 프레임 */}
            <Animated.Image
              source={require('@/src/assets/images/loading/foreground.png')}
              style={styles.frontgroundImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.btnRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.primary]}
              onPress={() => {
                // 마이데이터 연결 완료 플래그 설정
                featureFlags.setMyDataConnectEnabled(true);
                console.log('[ClassifySlots] 슬롯 나누기 버튼 클릭 - 마이데이터 연결 완료 플래그 설정됨');
                // 슬롯 나누기 화면으로 이동 (s1electDay.tsx)
                router.push('/(slotDivide)/s1electDay');
              }}
            >
              <ThemedText style={styles.btnText}>슬롯 나누기</ThemedText>
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
  congratulationBackground: {
    position: 'absolute',
    width: 500, // 더 크게 설정
    height: 500,
    zIndex: 1, // 텍스트 앞에 배치 (임시로 테스트)
  },
  bigText: { fontSize: 18, fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: 18 },
  
  // 슬롯 컨테이너
  slotContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  
  // circleEllipsback.png - 맨 밑 배경 레이어
  circleEllipsbackImage: {
    width: 280,
    height: 280,
    position: 'absolute',
    left: -35,    // ← 이 값으로 좌우 위치 조정
    bottom: -37,  // ← 이 값으로 상하 위치 조정
    zIndex: 0,    // ← 맨 밑 레이어
  },
  
  // 슬롯 파일들 (slotfiles.png) - 배경
  slotFilesImage: {
    width: 200,
    height: 200,
    position: 'absolute',
    zIndex: 1,
  },
  
  // finalslot.png - 위에 올리기 (위치 조정 가능)
  finalSlotImage: {
    width: 160,
    height: 200,
    position: 'absolute',
    left: 30,    // ← 이 값으로 좌우 위치 조정
    bottom: 20,  // ← 이 값으로 상하 위치 조정
    zIndex: 2,
  },
  
  // secondslot.png - 위에 올리기 (위치 조정 가능)
  secondSlotImage: {
    width: 165,
    height: 200,
    position: 'absolute',
    left: 2,    // ← 이 값으로 좌우 위치 조정
    bottom: 3,  // ← 이 값으로 상하 위치 조정
    zIndex: 4,
    transform: [{ rotate: '5deg' }],  // ← 이 값으로 회전 조정 (예: '5deg', '-3deg', '10deg')
  },
  
  // thirdslot.png - slotfiles.png와 같은 위치에 레이어
  thirdSlotImage: {
    width: 150,
    height: 200,
    position: 'absolute',
    left: 26,    // ← slotfiles.png와 같은 위치
    bottom: 22,  // ← slotfiles.png와 같은 위치
    zIndex: 3,
  },
  
  // firstslot.png - slotfiles.png 위에 올리기
  firstSlotImage: {
    width: 136,
    height: 200,
    position: 'absolute',
    left: 13,    // ← 이 값으로 좌우 위치 조정
    bottom: 14,  // ← 이 값으로 상하 위치 조정
    zIndex: 5,
  },
  
  // frontground.png - 맨 위에 프레임
  frontgroundImage: {
    width: 225,
    height: 230,
    position: 'absolute',
    left: -16,     // ← slotfiles.png와 같은 위치
    bottom: -19,   // ← slotfiles.png와 같은 위치
    zIndex: 6,
  },
  
  btnRow: { width: '100%', marginTop: 12 },
  btn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  primary: { backgroundColor: '#2383BD' },
  secondary: { backgroundColor: '#E5E7EB' },
  btnText: { color: '#fff', fontWeight: '700' },
  secondaryText: { color: '#111' },
});
