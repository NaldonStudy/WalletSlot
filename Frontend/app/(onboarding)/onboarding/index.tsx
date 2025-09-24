import { appService } from '@/src/services/appService';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

// 온보딩 슬라이드 데이터
const onboardingData = [
  {
    id: 1,
    title: '슬롯을 나눠봐요!',
    description: 'AI가 소비 패턴을 분석하여 자동으로 계좌를 예산 슬롯으로 나눠줘요.',
    emoji: '💰',
  },
  {
    id: 2,
    title: '지출을 한눈에!',
    description: '예산에 따른 지출을 언제나 간편하게 확인할 수 있어요.',
    emoji: '📊',
  },
  {
    id: 3,
    title: '소비 조각을 맞춰가는 즐거움',
    description: '자동으로 거래 내역을 분석하여 어떤 소비를 했는지 나눠줘요.',
    emoji: '🧩',
  },
  {
    id: 4,
    title: '소비를 계획적으로!',
    description: '계획적인 소비를 통해 원하는 목표를 이룰 수 있게 돼요.',
    emoji: '🎯',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      // 마지막 화면에서 시작하기 버튼
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleGoLogin = async () => {
    // 온보딩 완료 여부는 유지(건너뛰기와 동일하게 처리할지 정책에 따라 다름)
    await appService.setOnboardingCompleted(true);
    router.replace('/(auth)/(login)/login');
  };

  const handleComplete = async () => {
    // 온보딩 완료 플래그 저장
    await appService.setOnboardingCompleted(true);
    // 회원가입 이름 입력 화면으로 이동
    router.replace('/(auth)/(signup)/name');
  };

  const renderSlide = ({ item }: { item: typeof onboardingData[0] }) => (
    <View style={styles.slide}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderPageIndicator = () => (
    <View style={styles.pageIndicatorContainer}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.pageIndicator,
            { backgroundColor: index === currentIndex ? '#007AFF' : '#E5E5E7' },
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id.toString()}
      />
      
      <View style={styles.bottomContainer}>
        {renderPageIndicator()}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? '시작하기' : '다음'}
            </Text>
          </TouchableOpacity>
          
          {currentIndex < onboardingData.length - 1 && (
            <>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleGoLogin}>
                <Text style={styles.secondaryButtonText}>기존 회원 로그인 하러가기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>건너뛰기</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width: screenWidth,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1C1C1E',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#8E8E93',
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  secondaryButton: {
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 8,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipButtonText: {
    color: '#8E8E93',
    fontSize: 16,
  },
});
