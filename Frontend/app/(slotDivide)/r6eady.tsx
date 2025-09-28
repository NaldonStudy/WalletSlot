import { accountApi } from '@/src/api/account';
import { useSlotDivideStore } from '@/src/store/slotDivideStore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function R6eadyScreen() {
  const { getRecommendationResult, getApiData, setRecommendationResult, getUseAge, getUseGender, getIncomeLevel } = useSlotDivideStore();
  
  // 진행률 상태
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // 스피너 회전 애니메이션
  const spinValue = useState(new Animated.Value(0))[0];
  

  // API 호출 + 폴링 방식
  useEffect(() => {
    let currentProgress = 0;
    let isCompleted = false;
    let pollingAttempts = 0;
    const maxPollingAttempts = 80; // 최대 80초 (80번 시도)
    
    // API 호출 함수
    const callRecommendationAPI = async () => {
      try {
        console.log('🎯 [R6EADY] 슬롯 추천 API 호출 시작');
        
        // 1. 대표 계좌 조회
        const primaryAccount = await accountApi.getPrimaryAccount();
        const accountId = primaryAccount.data.accountId;
        console.log('🎯 [R6EADY] 대표 계좌 조회 성공:', { accountId });
        
        // 2. store에서 데이터 가져오기
        const storeData = getApiData();
        const { startDate, endDate, useAge, useGender, incomeLevel, income } = storeData;
        console.log('🎯 [R6EADY] Store 데이터:', { startDate, endDate, useAge, useGender, incomeLevel, income });
        
        // 모달 타입 판별 로그
        if (startDate && endDate) {
          console.log('🎯 [R6EADY] True 모달 플로우 감지 (날짜 기반)');
        } else if (useAge !== null || useGender !== null || incomeLevel) {
          console.log('🎯 [R6EADY] False 모달 플로우 감지 (프로필 기반)');
        } else {
          console.log('🎯 [R6EADY] 알 수 없는 모달 타입');
        }
        
        // 3. 모달 타입에 따른 API 분기 처리
        let recommendationResponse;
        
        if (startDate && endDate) {
          // True 모달: 날짜 기반 API 호출
          console.log('🎯 [R6EADY] 날짜 기반 API 호출');
          recommendationResponse = await accountApi.recommendSlotsByDate(accountId, {
            startDate,
            endDate
          });
        } else if (useAge !== null || useGender !== null || incomeLevel) {
          // False 모달: 프로필 기반 API 호출
          console.log('🎯 [R6EADY] 프로필 기반 API 호출');
          const numericIncome = parseInt(income.replace(/[^0-9]/g, ''), 10) || 0;
          recommendationResponse = await accountApi.recommendSlotsByProfile(accountId, {
            useAge: useAge || false,
            useGender: useGender || false,
            income: numericIncome
          });
        } else {
          throw new Error('추천 기준이 설정되지 않았습니다.');
        }
        
        console.log('🎯 [R6EADY] 슬롯 추천 API 응답:', recommendationResponse);
        
        // 4. 응답 처리
        if (recommendationResponse.success) {
          // 성공: store에 저장하고 현재 진행률 → 100% 빠르게
          setRecommendationResult(recommendationResponse);
          const remainingProgress = 100 - currentProgress;
          const fastInterval = setInterval(() => {
            currentProgress += remainingProgress / 10; // 10단계로 빠르게
            setProgress(Math.min(currentProgress, 100));
            
            if (currentProgress >= 100) {
              clearInterval(fastInterval);
              setIsLoading(false);
              setTimeout(() => {
                router.push('/(slotDivide)/a7djustSlot' as any);
              }, 500);
            }
          }, 50);
        } else {
          // 실패: 에러 모달 표시
          isCompleted = true;
          setErrorMessage(recommendationResponse.message || '슬롯 추천에 실패했습니다.');
          setShowErrorModal(true);
        }
      } catch (error) {
        console.error('🎯 [R6EADY] API 호출 실패:', error);
        isCompleted = true;
        setErrorMessage('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
        setShowErrorModal(true);
      }
    };
    
    // 즉시 API 호출 시작
    callRecommendationAPI();

    // 가변 속도 로딩 애니메이션 (최대 30초)
    const duration = 30000;
    const interval = 50;
    const totalSteps = duration / interval;
    const progressStep = 80 / totalSteps;
    
    let currentStep = 0;
    const progressInterval = setInterval(() => {
      if (!isCompleted) {
        currentStep++;
        currentProgress = Math.min(currentStep * progressStep, 80);
        setProgress(currentProgress);
      }
    }, interval);

    return () => {
      clearInterval(progressInterval);
    };
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

  // 컴포넌트 언마운트 시 상태 정리
  useEffect(() => {
    return () => {
      setShowErrorModal(false);
      setErrorMessage('');
      setIsLoading(true);
      setProgress(0);
    };
  }, []);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
    setIsLoading(false);
    setProgress(0);
    router.back();
  };

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

      {/* 에러 모달 */}
      {showErrorModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.errorTitle}>오류가 발생했습니다</Text>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
              <TouchableOpacity style={styles.goBackButton} onPress={handleCloseErrorModal}>
                <Text style={styles.goBackButtonText}>뒤로 가기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  
  // 에러 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 24,
    maxWidth: 320,
    width: '100%',
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  goBackButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  goBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
