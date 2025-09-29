import { ThemedText } from '@/components/ThemedText';
import { updateBaseDay } from '@/src/api/profile';
import { useLocalUserStore } from '@/src/store/localUserStore';
import { useSlotDivideStore } from '@/src/store/slotDivideStore';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function L2oadingScreen() {
  const { user } = useLocalUserStore();
  const { getBaseDay } = useSlotDivideStore();
  
  // 모달 상태
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAllAgreed, setIsAllAgreed] = useState(false);
  const [isRequired1Agreed, setIsRequired1Agreed] = useState(false);
  const [isRequired2Agreed, setIsRequired2Agreed] = useState(false);
  const [isOptionalAgreed, setIsOptionalAgreed] = useState(false);
  
  // 애니메이션 값들
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;
  
  // 퍼즐 조각들의 개별 애니메이션 값들
  const puzzleAnims = useRef([
    { fade: new Animated.Value(1), scale: new Animated.Value(1), translateX: new Animated.Value(0), translateY: new Animated.Value(0) },
    { fade: new Animated.Value(1), scale: new Animated.Value(1), translateX: new Animated.Value(0), translateY: new Animated.Value(0) },
    { fade: new Animated.Value(1), scale: new Animated.Value(1), translateX: new Animated.Value(0), translateY: new Animated.Value(0) },
    { fade: new Animated.Value(1), scale: new Animated.Value(1), translateX: new Animated.Value(0), translateY: new Animated.Value(0) },
    { fade: new Animated.Value(1), scale: new Animated.Value(1), translateX: new Animated.Value(0), translateY: new Animated.Value(0) },
    { fade: new Animated.Value(1), scale: new Animated.Value(1), translateX: new Animated.Value(0), translateY: new Animated.Value(0) },
  ]).current;
  
  // usericon.png의 fade in 애니메이션 값
  const userIconFadeAnim = useRef(new Animated.Value(0)).current; // 초기값 0 (숨김)
  
  // yellowbus.png의 애니메이션 값들
  const yellowBusFadeAnim = useRef(new Animated.Value(0)).current; // 초기값 0 (숨김)
  const yellowBusTranslateX = useRef(new Animated.Value(-200)).current; // 화면 밖에서 시작
  const yellowBusTranslateY = useRef(new Animated.Value(-150)).current; // 화면 밖에서 시작
  
  // bluehome.png의 애니메이션 값들
  const blueHomeFadeAnim = useRef(new Animated.Value(0)).current; // 초기값 0 (숨김)
  const blueHomeTranslateX = useRef(new Animated.Value(200)).current; // 화면 밖에서 시작 (1~2시 방향)
  const blueHomeTranslateY = useRef(new Animated.Value(-150)).current; // 화면 밖에서 시작
  
  // redeat.png의 애니메이션 값들 (9시 방향)
  const redEatFadeAnim = useRef(new Animated.Value(0)).current; // 초기값 0 (숨김)
  const redEatTranslateX = useRef(new Animated.Value(-200)).current; // 화면 밖에서 시작 (9시 방향)
  const redEatTranslateY = useRef(new Animated.Value(0)).current; // 화면 밖에서 시작
  
  // neonpill.png의 애니메이션 값들 (3시 방향)
  const neonPillFadeAnim = useRef(new Animated.Value(0)).current; // 초기값 0 (숨김)
  const neonPillTranslateX = useRef(new Animated.Value(200)).current; // 화면 밖에서 시작 (3시 방향)
  const neonPillTranslateY = useRef(new Animated.Value(0)).current; // 화면 밖에서 시작
  
  // skyedu.png의 애니메이션 값들 (7~8시 방향)
  const skyEduFadeAnim = useRef(new Animated.Value(0)).current; // 초기값 0 (숨김)
  const skyEduTranslateX = useRef(new Animated.Value(-180)).current; // 화면 밖에서 시작 (7~8시 방향)
  const skyEduTranslateY = useRef(new Animated.Value(120)).current; // 화면 밖에서 시작
  
  // purpleclothes.png의 애니메이션 값들 (4~5시 방향)
  const purpleClothesFadeAnim = useRef(new Animated.Value(0)).current; // 초기값 0 (숨김)
  const purpleClothesTranslateX = useRef(new Animated.Value(180)).current; // 화면 밖에서 시작 (4~5시 방향)
  const purpleClothesTranslateY = useRef(new Animated.Value(120)).current; // 화면 밖에서 시작
  
  const handleGoBack = () => {
    router.replace('/(slotDivide)/s1electDay' as any);
  };

  // 모달 관련 함수들
  const handleRecommendButton = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleAllAgree = () => {
    const newValue = !isAllAgreed;
    setIsAllAgreed(newValue);
    setIsRequired1Agreed(newValue);
    setIsRequired2Agreed(newValue);
    setIsOptionalAgreed(newValue);
  };

  const handleRequired1Agree = () => {
    const newValue = !isRequired1Agreed;
    setIsRequired1Agreed(newValue);
    // 필수 항목이 모두 체크되면 전체 동의도 체크
    if (newValue && isRequired2Agreed) {
      setIsAllAgreed(true);
    } else {
      setIsAllAgreed(false);
    }
  };

  const handleRequired2Agree = () => {
    const newValue = !isRequired2Agreed;
    setIsRequired2Agreed(newValue);
    // 필수 항목이 모두 체크되면 전체 동의도 체크
    if (newValue && isRequired1Agreed) {
      setIsAllAgreed(true);
    } else {
      setIsAllAgreed(false);
    }
  };

  const handleOptionalAgree = () => {
    setIsOptionalAgreed(!isOptionalAgreed);
  };

  const handleConfirm = async () => {
    if (isRequired1Agreed && isRequired2Agreed) {
      // 필수 항목에 모두 동의한 경우 baseDay 패치 후 다음 화면으로 이동
      try {
        console.log('🎯 [L2OADING] 동의 완료 - baseDay 패치 시작');
        
        // store에서 baseDay 가져오기
        const baseDay = getBaseDay();
        console.log('🎯 [L2OADING] 현재 baseDay:', baseDay);
        
        if (baseDay) {
          const numericBaseDay = parseInt(baseDay, 10);
          
          // baseDay 값 검증
          console.log('🎯 [L2OADING] baseDay 검증 시작:', {
            baseDay: numericBaseDay,
            today: new Date().getDate(),
            isValidRange: numericBaseDay >= 1 && numericBaseDay <= 31
          });
          
          // 범위 검증 (1-31)
          if (numericBaseDay < 1 || numericBaseDay > 31) {
            throw new Error(`baseDay는 1-31 범위여야 합니다. 현재 값: ${numericBaseDay}`);
          }
          
          // 오늘 날짜와 비교 검증
          const today = new Date().getDate();
          if (numericBaseDay > today) {
            console.warn('🎯 [L2OADING] baseDay가 오늘 날짜보다 이후입니다:', {
              baseDay: numericBaseDay,
              today: today,
              warning: '서버에서 에러가 발생할 수 있습니다.'
            });
          }
          
          // baseDay 패치 API 호출
          await updateBaseDay(numericBaseDay);
          console.log('🎯 [L2OADING] baseDay 패치 성공:', baseDay);
        } else {
          console.warn('🎯 [L2OADING] baseDay가 없어서 패치 건너뜀');
        }
        
        // 모달 닫기
        setIsModalVisible(false);
        
        // 다음 화면으로 이동
        router.push('/(slotDivide)/i4nputIncome' as any);
        
      } catch (error) {
        console.error('🎯 [L2OADING] baseDay 패치 실패:', error);
        
        // 패치 실패해도 다음 화면으로 이동 (사용자 경험 우선)
        Alert.alert(
          '알림', 
          '기준일 설정에 실패했지만 계속 진행합니다.',
          [
            {
              text: '확인',
              onPress: () => {
                setIsModalVisible(false);
                router.push('/(slotDivide)/i4nputIncome' as any);
              }
            }
          ]
        );
      }
    }
  };

  const handleViewDetails = () => {
    // 자세히 보기 버튼 클릭 시 p3ermission 화면으로 이동
    router.push('/(slotDivide)/p3ermission' as any);
  };
  
  // 퍼즐 조각들이 퍼지면서 사라지는 애니메이션
  const startPuzzleExplosion = () => {
    const animations = puzzleAnims.map((anim, index) => {
      // 각 조각마다 시계 방향으로 퍼지도록 설정
      const directions = [
        { x: -180, y: -120 }, // orange.png - 10~11시 방향
        { x: 180, y: -120 },  // blue.png - 1~2시 방향
        { x: -200, y: 0 },    // red.png - 9시 방향
        { x: 200, y: 0 },     // neonblue.png - 3시 방향
        { x: -180, y: 120 },  // skyblue.png - 7~8시 방향
        { x: 180, y: 120 },   // purple.png - 4~5시 방향
      ];
      
      const direction = directions[index];
      
      return Animated.parallel([
        Animated.timing(anim.fade, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.scale, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateX, {
          toValue: direction.x,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: direction.y,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);
    });
    
    // 퍼즐 조각 애니메이션 시작
    Animated.parallel(animations).start();
    
    // 퍼즐 조각 사라지는 끝무렵에 usericon 나타남 (0.5초 후)
    setTimeout(() => {
      Animated.timing(userIconFadeAnim, {
        toValue: 1,
        duration: 300, // 0.3초 동안 fade in
        useNativeDriver: true,
      }).start();
    }, 500); // 1초 중 0.5초 후에 시작 (끝무렵)
    
           // usericon 나타난 후 모든 아이콘들이 날아옴 (1.2초 후)
           setTimeout(() => {
             Animated.parallel([
               // yellowbus 애니메이션 (11시 방향)
               Animated.timing(yellowBusFadeAnim, {
                 toValue: 1,
                 duration: 400, // 0.4초 동안 fade in
                 useNativeDriver: true,
               }),
               Animated.timing(yellowBusTranslateX, {
                 toValue: -60, // usericon의 11시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
               Animated.timing(yellowBusTranslateY, {
                 toValue: -40, // usericon의 11시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
               // bluehome 애니메이션 (1~2시 방향)
               Animated.timing(blueHomeFadeAnim, {
                 toValue: 1,
                 duration: 400, // 0.4초 동안 fade in
                 useNativeDriver: true,
               }),
               Animated.timing(blueHomeTranslateX, {
                 toValue: 60, // usericon의 1~2시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
               Animated.timing(blueHomeTranslateY, {
                 toValue: -40, // usericon의 1~2시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
               // redeat 애니메이션 (9시 방향)
               Animated.timing(redEatFadeAnim, {
                 toValue: 1,
                 duration: 400, // 0.4초 동안 fade in
                 useNativeDriver: true,
               }),
               Animated.timing(redEatTranslateX, {
                 toValue: -60, // usericon의 9시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
               Animated.timing(redEatTranslateY, {
                 toValue: 0, // usericon의 9시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
               // neonpill 애니메이션 (3시 방향)
               Animated.timing(neonPillFadeAnim, {
                 toValue: 1,
                 duration: 400, // 0.4초 동안 fade in
                 useNativeDriver: true,
               }),
               Animated.timing(neonPillTranslateX, {
                 toValue: 60, // usericon의 3시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
               Animated.timing(neonPillTranslateY, {
                 toValue: 0, // usericon의 3시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
               // skyedu 애니메이션 (7~8시 방향)
               Animated.timing(skyEduFadeAnim, {
                 toValue: 1,
                 duration: 400, // 0.4초 동안 fade in
                 useNativeDriver: true,
               }),
               Animated.timing(skyEduTranslateX, {
                 toValue: -60, // usericon의 7~8시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
               Animated.timing(skyEduTranslateY, {
                 toValue: 40, // usericon의 7~8시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
               // purpleclothes 애니메이션 (4~5시 방향)
               Animated.timing(purpleClothesFadeAnim, {
                 toValue: 1,
                 duration: 400, // 0.4초 동안 fade in
                 useNativeDriver: true,
               }),
               Animated.timing(purpleClothesTranslateX, {
                 toValue: 60, // usericon의 4~5시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
               Animated.timing(purpleClothesTranslateY, {
                 toValue: 40, // usericon의 4~5시 방향으로 이동
                 duration: 600, // 0.6초 동안 이동
                 useNativeDriver: true,
               }),
             ]).start();
           }, 1200); // 1.2초 후에 시작
  };
  
  // 컴포넌트 마운트 시 애니메이션 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      startPuzzleExplosion();
    }, 1000); // 1초 후 애니메이션 시작
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <ThemedText style={styles.backButtonText}>← 뒤로</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.title}>{user?.userName || '사용자'}님의 맞춤 슬롯을 추천합니다.</ThemedText>
          
          {/* 퍼즐 그룹 이미지 */}
          <View style={styles.puzzleContainer}>
            {/* 배경 그룹 이미지 */}
            {/*
            <Image 
              source={require('@/src/assets/images/divideImage/Group.png')} 
              style={styles.puzzleGroupImage}
              resizeMode="contain"
            />
            */}
            
            {/* 오렌지 조각 (위에 레이어) */}
            <Animated.Image 
              source={require('@/src/assets/images/divideImage/orange.png')} 
              style={[
                styles.orangeOverlay,
                {
                  opacity: puzzleAnims[0].fade,
                  transform: [
                    { scale: puzzleAnims[0].scale },
                    { translateX: puzzleAnims[0].translateX },
                    { translateY: puzzleAnims[0].translateY },
                  ],
                }
              ]}
              resizeMode="contain"
            />
            
            {/* 파란색 조각 (위에 레이어) */}
            <Animated.Image 
              source={require('@/src/assets/images/divideImage/blue.png')} 
              style={[
                styles.blueOverlay,
                {
                  opacity: puzzleAnims[1].fade,
                  transform: [
                    { scale: puzzleAnims[1].scale },
                    { translateX: puzzleAnims[1].translateX },
                    { translateY: puzzleAnims[1].translateY },
                  ],
                }
              ]}
              resizeMode="contain"
            />
            
            {/* 빨간색 조각 (위에 레이어) */}
            <Animated.Image 
              source={require('@/src/assets/images/divideImage/red.png')} 
              style={[
                styles.redOverlay,
                {
                  opacity: puzzleAnims[2].fade,
                  transform: [
                    { scale: puzzleAnims[2].scale },
                    { translateX: puzzleAnims[2].translateX },
                    { translateY: puzzleAnims[2].translateY },
                  ],
                }
              ]}
              resizeMode="contain"
            />
            
            {/* 네온블루 조각 (위에 레이어) */}
            <Animated.Image 
              source={require('@/src/assets/images/divideImage/neonblue.png')} 
              style={[
                styles.neonblueOverlay,
                {
                  opacity: puzzleAnims[3].fade,
                  transform: [
                    { scale: puzzleAnims[3].scale },
                    { translateX: puzzleAnims[3].translateX },
                    { translateY: puzzleAnims[3].translateY },
                  ],
                }
              ]}
              resizeMode="contain"
            />
            
            {/* 스카이블루 조각 (위에 레이어) */}
            <Animated.Image 
              source={require('@/src/assets/images/divideImage/skyblue.png')} 
              style={[
                styles.skyblueOverlay,
                {
                  opacity: puzzleAnims[4].fade,
                  transform: [
                    { scale: puzzleAnims[4].scale },
                    { translateX: puzzleAnims[4].translateX },
                    { translateY: puzzleAnims[4].translateY },
                  ],
                }
              ]}
              resizeMode="contain"
            />
            
            {/* 퍼플 조각 (위에 레이어) */}
            <Animated.Image 
              source={require('@/src/assets/images/divideImage/purple.png')} 
              style={[
                styles.purpleOverlay,
                {
                  opacity: puzzleAnims[5].fade,
                  transform: [
                    { scale: puzzleAnims[5].scale },
                    { translateX: puzzleAnims[5].translateX },
                    { translateY: puzzleAnims[5].translateY },
                  ],
                }
              ]}
              resizeMode="contain"
            />
            
            {/* usericon.png (퍼즐 사라진 후 나타남) */}
            <Animated.Image
              source={require('@/src/assets/images/divideImage/usericon.png')}
              style={[
                styles.userIcon,
                { opacity: userIconFadeAnim }
              ]}
              resizeMode="contain"
            />
            
                   {/* yellowbus.png (usericon 나타난 후 날아옴) */}
                   <Animated.Image
                     source={require('@/src/assets/images/divideImage/yellowbus.png')}
                     style={[
                       styles.yellowBus,
                       {
                         opacity: yellowBusFadeAnim,
                         transform: [
                           { translateX: yellowBusTranslateX },
                           { translateY: yellowBusTranslateY },
                         ],
                       }
                     ]}
                     resizeMode="contain"
                   />
                   
                   {/* bluehome.png (usericon 나타난 후 날아옴) */}
                   <Animated.Image
                     source={require('@/src/assets/images/divideImage/bluehome.png')}
                     style={[
                       styles.blueHome,
                       {
                         opacity: blueHomeFadeAnim,
                         transform: [
                           { translateX: blueHomeTranslateX },
                           { translateY: blueHomeTranslateY },
                         ],
                       }
                     ]}
                     resizeMode="contain"
                   />
                   
                   {/* redeat.png (usericon 나타난 후 날아옴) */}
                   <Animated.Image
                     source={require('@/src/assets/images/divideImage/redeat.png')}
                     style={[
                       styles.redEat,
                       {
                         opacity: redEatFadeAnim,
                         transform: [
                           { translateX: redEatTranslateX },
                           { translateY: redEatTranslateY },
                         ],
                       }
                     ]}
                     resizeMode="contain"
                   />
                   
                   {/* neonpill.png (usericon 나타난 후 날아옴) */}
                   <Animated.Image
                     source={require('@/src/assets/images/divideImage/neonpill.png')}
                     style={[
                       styles.neonPill,
                       {
                         opacity: neonPillFadeAnim,
                         transform: [
                           { translateX: neonPillTranslateX },
                           { translateY: neonPillTranslateY },
                         ],
                       }
                     ]}
                     resizeMode="contain"
                   />
                   
                   {/* skyedu.png (usericon 나타난 후 날아옴) */}
                   <Animated.Image
                     source={require('@/src/assets/images/divideImage/skyedu.png')}
                     style={[
                       styles.skyEdu,
                       {
                         opacity: skyEduFadeAnim,
                         transform: [
                           { translateX: skyEduTranslateX },
                           { translateY: skyEduTranslateY },
                         ],
                       }
                     ]}
                     resizeMode="contain"
                   />
                   
                   {/* purpleclothes.png (usericon 나타난 후 날아옴) */}
                   <Animated.Image
                     source={require('@/src/assets/images/divideImage/purpleclothes.png')}
                     style={[
                       styles.purpleClothes,
                       {
                         opacity: purpleClothesFadeAnim,
                         transform: [
                           { translateX: purpleClothesTranslateX },
                           { translateY: purpleClothesTranslateY },
                         ],
                       }
                     ]}
                     resizeMode="contain"
                   />
          </View>
          
          <TouchableOpacity style={styles.recommendButton} onPress={handleRecommendButton}>
            <ThemedText style={styles.recommendButtonText}>맞춤 슬롯 추천받기</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 동의 모달 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* 모달 헤더 */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <ThemedText style={styles.closeButtonText}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            {/* 모달 내용 */}
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>
                필수 항목에 동의해야 계속 진행할 수 있습니다.
              </ThemedText>

              {/* 전체 동의 */}
              <TouchableOpacity style={styles.allAgreeContainer} onPress={handleAllAgree}>
                <View style={styles.allAgreeContent}>
                  <View style={[styles.checkbox, isAllAgreed && styles.checkboxChecked]}>
                    {isAllAgreed && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                  </View>
                  <ThemedText style={styles.allAgreeText}>
                    전체 동의
                  </ThemedText>
                </View>
                <TouchableOpacity style={styles.detailsButton} onPress={handleViewDetails}>
                  <ThemedText style={styles.detailsButtonText}>[자세히 보기]</ThemedText>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* 필수 항목 1 */}
              <TouchableOpacity style={styles.agreeItem} onPress={handleRequired1Agree}>
                <View style={[styles.checkbox, isRequired1Agreed && styles.checkboxChecked]}>
                  {isRequired1Agreed && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </View>
                <ThemedText style={styles.agreeText}>
                  [필수] 내 정보 수집·이용 동의
                </ThemedText>
              </TouchableOpacity>

              {/* 필수 항목 2 */}
              <TouchableOpacity style={styles.agreeItem} onPress={handleRequired2Agree}>
                <View style={[styles.checkbox, isRequired2Agreed && styles.checkboxChecked]}>
                  {isRequired2Agreed && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </View>
                <ThemedText style={styles.agreeText}>
                  [필수] 제3자 제공 동의
                </ThemedText>
              </TouchableOpacity>

              {/* 선택 항목 */}
              <TouchableOpacity style={styles.agreeItem} onPress={handleOptionalAgree}>
                <View style={[styles.checkbox, isOptionalAgreed && styles.checkboxChecked]}>
                  {isOptionalAgreed && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </View>
                <ThemedText style={styles.agreeText}>
                  [선택] AI 모델 학습 활용 동의
                </ThemedText>
              </TouchableOpacity>

              {/* 확인 버튼 */}
              <TouchableOpacity 
                style={[
                  styles.confirmButton, 
                  (!isRequired1Agreed || !isRequired2Agreed) && styles.confirmButtonDisabled
                ]} 
                onPress={handleConfirm}
                disabled={!isRequired1Agreed || !isRequired2Agreed}
              >
                <ThemedText style={[
                  styles.confirmButtonText,
                  (!isRequired1Agreed || !isRequired2Agreed) && styles.confirmButtonTextDisabled
                ]}>
                  맞춤 슬롯 추천받기
                </ThemedText>
              </TouchableOpacity>

              {/* 하단 안내 텍스트 */}
              <ThemedText style={styles.footerText}>
                자세한 내용은 <ThemedText style={styles.linkText}>이용약관</ThemedText> 및 <ThemedText style={styles.linkText}>개인정보처리방침</ThemedText>을 확인해주세요. 필수 항목에 동의해야 계속 진행할 수 있습니다.
              </ThemedText>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
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
    marginBottom: 40,
  },
  puzzleContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    position: 'relative',
  },
  puzzleGroupImage: {
    width: 400,
    height: 220,
    position: 'absolute',
    zIndex: 1,
    top: 15,
  },
  orangeOverlay: {
    width: 155,
    height: 93,
    position: 'absolute',
    zIndex: 2,
    top: 15,
    left: -153,
  },
  blueOverlay: {
    width: 150,
    height: 87,
    position: 'absolute',
    zIndex: 2,
    top: 15,
    left: -7,
  },
  redOverlay: {
    width: 160,
    height: 90,
    position: 'absolute',
    zIndex: 2,
    top: 79,
    left: -147,
  },
  neonblueOverlay: {
    width: 144,
    height: 88,
    position: 'absolute',
    zIndex: 2,
    top: 80,
    left: -4,
  },
  skyblueOverlay: {
    width: 144,
    height: 90,
    position: 'absolute',
    zIndex: 2,
    top: 142,
    left: -147,
  },
  purpleOverlay: {
    width: 159,
    height: 115,
    position: 'absolute',
    zIndex: 2,
    top: 129,
    left: -19,
  },
  puzzleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  puzzlePiece: {
    width: 100,
    height: 100,
    marginHorizontal: 4,
  },
  recommendButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  recommendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userIcon: {
    width: 70,
    height: 70,
    position: 'absolute',
    zIndex: 3, // 퍼즐 조각들보다 위에 오도록
    top: 65, // 가운데 정렬
    left: -45, // 가운데 정렬 (width의 절반만큼 왼쪽으로)
  },
  yellowBus: {
    width: 120,
    height: 100,
    position: 'absolute',
    zIndex: 4, // usericon보다 위에
    top: 15, // usericon과 같은 높이
    left: -85, // usericon과 같은 중앙선
  },
  blueHome: {
    width: 120,
    height: 115,
    position: 'absolute',
    zIndex: 4, // usericon보다 위에
    top: 8, // usericon과 같은 높이
    left: -50, // usericon과 같은 중앙선
  },
  redEat: {
    width: 120,
    height: 100,
    position: 'absolute',
    zIndex: 4, // usericon보다 위에
    top: 55, // usericon과 같은 높이
    left: -125, // usericon과 같은 중앙선
  },
  neonPill: {
    width: 120,
    height: 100,
    position: 'absolute',
    zIndex: 4, // usericon보다 위에
    top: 55, // usericon과 같은 높이
    left: -15, // usericon과 같은 중앙선
  },
  skyEdu: {
    width: 120,
    height: 100,
    position: 'absolute',
    zIndex: 4, // usericon보다 위에
    top: 95, // usericon과 같은 높이
    left: -85, // usericon과 같은 중앙선
  },
  purpleClothes: {
    width: 120,
    height: 100,
    position: 'absolute',
    zIndex: 4, // usericon보다 위에
    top: 95, // usericon과 같은 높이
    left: -50, // usericon과 같은 중앙선
  },
  // 개별 퍼즐 조각 위치 조절
  orangePiece: {
    // 오렌지 조각 위치 조절
    marginTop: 0,
    marginLeft: 0,
  },
  redPiece: {
    // 빨간색 조각 위치 조절
    marginTop: 0,
    marginLeft: 0,
  },
  skybluePiece: {
    // 하늘색 조각 위치 조절
    marginTop: 0,
    marginLeft: 0,
  },
  bluePiece: {
    // 파란색 조각 위치 조절
    marginTop: 0,
    marginLeft: 0,
  },
  purplePiece: {
    // 보라색 조각 위치 조절
    marginTop: 0,
    marginLeft: 0,
  },
  neonbluePiece: {
    // 네온블루 조각 위치 조절
    marginTop: 0,
    marginLeft: 0,
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '600',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 30,
  },
  allAgreeContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allAgreeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  allAgreeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  detailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  agreeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  agreeText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: '#9CA3AF',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#000000',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
