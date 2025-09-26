import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function InputInfoScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [budgetDay, setBudgetDay] = useState('12');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서 완료
      console.log('입력 완료:', {
        budgetDay,
        monthlyIncome
      });
      router.back();
    }
  };

  const handleIncomeChange = (text: string) => {
    // 숫자만 입력 허용
    const numbers = text.replace(/[^0-9]/g, '');
    setMonthlyIncome(numbers);
  };

  const formatIncome = (value: string) => {
    if (!value) return '';
    const num = parseInt(value);
    return num.toLocaleString();
  };

  const getIncomeInKorean = (value: string) => {
    if (!value) return '';
    const num = parseInt(value);
    if (num >= 10000) {
      return `${Math.floor(num / 10000)}만원`;
    }
    return `${num}원`;
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.title}>예산 편성 기준일을 선택해주세요.</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>기준일</ThemedText>
        <TouchableOpacity style={styles.input}>
          <ThemedText style={styles.inputText}>매월</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarContainer}>
        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              budgetDay === day.toString() && styles.selectedDay
            ]}
            onPress={() => setBudgetDay(day.toString())}
          >
            <ThemedText style={[
              styles.dayText,
              budgetDay === day.toString() && styles.selectedDayText
            ]}>
              {day}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.title}>00님의 맞춤 슬롯을 추천합니다.</ThemedText>
      
      <View style={styles.slotRecommendationContainer}>
        <View style={styles.puzzleContainer}>
          {/* 퍼즐 조각들 */}
          <View style={[styles.puzzlePiece, styles.puzzleYellow]} />
          <View style={[styles.puzzlePiece, styles.puzzleBlue]} />
          <View style={[styles.puzzlePiece, styles.puzzlePurple]} />
          <View style={[styles.puzzlePiece, styles.puzzleOrange]} />
          <View style={[styles.puzzlePiece, styles.puzzleGreen]} />
          <View style={[styles.puzzlePiece, styles.puzzleDarkBlue]} />
        </View>
        
        <View style={styles.profileContainer}>
          <View style={styles.profileCircle}>
            <ThemedText style={styles.profileText}>H 은경</ThemedText>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.title}>월 수입을 입력해주세요.</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>기준일</ThemedText>
        <ThemedText style={styles.budgetDayText}>매월 {budgetDay}일</ThemedText>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>월 수입</ThemedText>
        <TextInput
          style={styles.incomeInput}
          value={formatIncome(monthlyIncome)}
          onChangeText={handleIncomeChange}
          placeholder="30,000"
          keyboardType="number-pad"
          maxLength={10}
        />
        {monthlyIncome && (
          <ThemedText style={styles.incomeKorean}>
            {getIncomeInKorean(monthlyIncome)}
          </ThemedText>
        )}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <ThemedText style={styles.title}>월 수입을 입력해주세요.</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>기준일</ThemedText>
        <ThemedText style={styles.budgetDayText}>매월 {budgetDay}일</ThemedText>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>월 수입</ThemedText>
        <TextInput
          style={styles.incomeInput}
          value={formatIncome(monthlyIncome)}
          onChangeText={handleIncomeChange}
          placeholder="3,000,000"
          keyboardType="number-pad"
          maxLength={10}
        />
        {monthlyIncome && (
          <ThemedText style={styles.incomeKorean}>
            {getIncomeInKorean(monthlyIncome)}
          </ThemedText>
        )}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 1:
        return '다음';
      case 2:
        return '맞춤 슬롯 추천받기';
      case 3:
        return '다음';
      case 4:
        return '완료';
      default:
        return '다음';
    }
  };

  const isButtonEnabled = () => {
    switch (currentStep) {
      case 1:
        return budgetDay !== '';
      case 2:
        return true;
      case 3:
        return monthlyIncome !== '';
      case 4:
        return monthlyIncome !== '';
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !isButtonEnabled() && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!isButtonEnabled()}
          >
            <ThemedText style={[
              styles.nextButtonText,
              !isButtonEnabled() && styles.nextButtonTextDisabled
            ]}>
              {getButtonText()}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#111827',
  },
  budgetDayText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  dayButton: {
    width: (width - 80) / 7,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedDay: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  dayText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  slotRecommendationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  puzzleContainer: {
    width: 200,
    height: 200,
    position: 'relative',
    marginBottom: 20,
  },
  puzzlePiece: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  puzzleYellow: {
    backgroundColor: '#FCD34D',
    top: 20,
    left: 20,
  },
  puzzleBlue: {
    backgroundColor: '#93C5FD',
    top: 20,
    right: 20,
  },
  puzzlePurple: {
    backgroundColor: '#C4B5FD',
    top: 80,
    left: 10,
  },
  puzzleOrange: {
    backgroundColor: '#FDBA74',
    top: 80,
    right: 10,
  },
  puzzleGreen: {
    backgroundColor: '#86EFAC',
    bottom: 20,
    left: 30,
  },
  puzzleDarkBlue: {
    backgroundColor: '#3B82F6',
    bottom: 20,
    right: 30,
  },
  profileContainer: {
    alignItems: 'center',
  },
  profileCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  incomeInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  incomeKorean: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  nextButton: {
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
});