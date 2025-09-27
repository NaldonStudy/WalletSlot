import { useSlotDivideStore } from '@/src/store/slotDivideStore';
// import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function I5nputPeriodScreen() {
  const { data, setPeriod } = useSlotDivideStore();

  // 애니메이션 값들
  const contentOpacity = useState(new Animated.Value(0))[0];
  const contentTranslateY = useState(new Animated.Value(50))[0];
  
  // 떠다니는 애니메이션 값들
  const dashboardFloatY = useState(new Animated.Value(0))[0];
  const circlechartFloatY = useState(new Animated.Value(0))[0];

  // 모달 상태
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'period' | 'criteria'>('period');
  const [periodInput, setPeriodInput] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState('');
  
  // 날짜 선택 상태
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);
  const [startDate, setStartDate] = useState('2025.01.01');
  const [endDate, setEndDate] = useState('2025.09.08');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState<'start' | 'end'>('start');
  
  // Picker용 날짜 상태 (오늘 날짜로 초기화)
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  // 윤년 확인 함수
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // 해당 월의 일수 계산 함수
  const getDaysInMonth = (year: number, month: number): number => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && isLeapYear(year)) {
      return 29;
    }
    return daysInMonth[month - 1];
  };

  // 일 자동 보정 함수
  const adjustDayIfNeeded = (year: number, month: number, day: number): number => {
    const maxDays = getDaysInMonth(year, month);
    return Math.min(day, maxDays);
  };

  // 컴포넌트 마운트 시 애니메이션 실행
  useEffect(() => {
    // 기본 페이드인 애니메이션
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // 떠다니는 애니메이션 함수
    const createFloatingAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: -8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // dashboard 애니메이션 (즉시 시작)
    const dashboardAnimation = createFloatingAnimation(dashboardFloatY, 0);
    
    // circlechart 애니메이션 (0.6초 후 시작)
    const circlechartAnimation = createFloatingAnimation(circlechartFloatY, 600);

    // 애니메이션 시작
    dashboardAnimation.start();
    
    setTimeout(() => {
      circlechartAnimation.start();
    }, 600);

    // 컴포넌트 언마운트 시 애니메이션 정리
    return () => {
      dashboardAnimation.stop();
      circlechartAnimation.stop();
    };
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleNext = () => {
    console.log('🎯 [I5NPUT_PERIOD] 다음 버튼 클릭됨!');
    
    // TODO: 실제 API 호출로 변경
    // const hasEnoughData = await checkAccountHistory();
    const hasEnoughData = Math.random() > 0.5; // 임시로 랜덤 값 사용
    
    if (hasEnoughData) {
      // 3개월 이상 기록이 있는 경우 - 기간 입력 모달
      setModalType('period');
      setIsModalVisible(true);
    } else {
      // 기록이 부족한 경우 - 추천 기준 선택 모달
      setModalType('criteria');
      setIsModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setPeriodInput('');
    setSelectedCriteria('');
    setIsCustomPeriod(false);
    setIsDatePickerVisible(false);
  };

  const handlePeriodSelect = (period: string) => {
    if (period === '직접설정') {
      setIsCustomPeriod(true);
    } else {
      setPeriodInput(period);
      setIsCustomPeriod(false);
    }
  };

  // 날짜 필드 클릭 핸들러
  const handleDateFieldPress = (type: 'start' | 'end') => {
    setSelectedDateType(type);
    setIsDatePickerVisible(true);
    
    // 현재 선택된 날짜로 초기화
    if (type === 'start') {
      const [year, month, day] = startDate.split('.').map(Number);
      setSelectedYear(year);
      setSelectedMonth(month);
      setSelectedDay(day);
    } else {
      const [year, month, day] = endDate.split('.').map(Number);
      setSelectedYear(year);
      setSelectedMonth(month);
      setSelectedDay(day);
    }
  };

  // Picker 값 변경 핸들러
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    // 연도 변경 시 일 자동 보정
    const adjustedDay = adjustDayIfNeeded(year, selectedMonth, selectedDay);
    setSelectedDay(adjustedDay);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    // 월 변경 시 일 자동 보정
    const adjustedDay = adjustDayIfNeeded(selectedYear, month, selectedDay);
    setSelectedDay(adjustedDay);
  };

  const handleDayChange = (day: number) => {
    setSelectedDay(day);
  };

  // 날짜 확인 핸들러
  const handleDateConfirm = () => {
    const formattedDate = `${selectedYear}.${selectedMonth.toString().padStart(2, '0')}.${selectedDay.toString().padStart(2, '0')}`;
    
    if (selectedDateType === 'start') {
      setStartDate(formattedDate);
    } else {
      setEndDate(formattedDate);
    }
    
    setIsDatePickerVisible(false);
  };

  // 모달 닫기 핸들러
  const handleDatePickerClose = () => {
    setIsDatePickerVisible(false);
  };



  const handlePeriodConfirm = () => {
    if (isCustomPeriod) {
      setPeriod(`${startDate} ~ ${endDate}`);
    } else if (periodInput.trim()) {
      setPeriod(periodInput);
    } else {
      return;
    }
    
    setIsModalVisible(false);
    router.push('/(slotDivide)/r6eady' as any);
  };

  const handleCriteriaConfirm = () => {
    if (selectedCriteria) {
      setPeriod(selectedCriteria);
      setIsModalVisible(false);
      router.push('/(slotDivide)/r6eady' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleGoBack}
            >
              <Text style={styles.backButtonText}>← 뒤로</Text>
            </TouchableOpacity>
          </View>

          <Animated.View 
            style={[
              styles.content,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
              },
            ]}
          >
            <Text style={styles.title}>분석 기간을 골라볼까요?</Text>
            
            {/* 이미지 레이어들 */}
            <View style={styles.imageContainer}>
              {/* 맨 밑 레이어: circleEllipsback.png */}
              <Image 
                source={require('@/src/assets/images/backgroundstyle/circleEllipsback.png')} 
                style={styles.circleEllipsbackImage}
                resizeMode="contain"
              />
              
              {/* 중간 레이어: dashboard.png */}
              <Animated.Image 
                source={require('@/src/assets/images/divideImage/dashboard.png')} 
                style={[
                  styles.dashboardImage,
                  {
                    transform: [{ translateY: dashboardFloatY }],
                  },
                ]}
                resizeMode="contain"
              />
              
              {/* 맨 위 레이어: circlechart.png */}
              <Animated.Image 
                source={require('@/src/assets/images/divideImage/circlechart.png')} 
                style={[
                  styles.circlechartImage,
                  {
                    transform: [{ translateY: circlechartFloatY }],
                  },
                ]}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.description1}>
              최근 거래를 살펴보고 맞춤 예산 가이드를 만들어드릴게요.
            </Text>
            <Text style={styles.description2}>
              기록이 적다면, 비슷한 수입대와 연령대/성별 기준으로 AI가 추천해드려요.
            </Text>
            
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>다음</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      {/* 모달 */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* 핸들 바 */}
            <View style={styles.modalHandle} />
            
            {modalType === 'period' ? (
              // 기간 선택 모달 (true일 때)
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalTitle}>기간 선택</Text>
                
                <View style={styles.periodOptions}>
                  <TouchableOpacity 
                    style={[styles.periodOption, periodInput === '3개월' && styles.periodOptionSelected]}
                    onPress={() => handlePeriodSelect('3개월')}
                  >
                    <Text style={[styles.periodOptionText, periodInput === '3개월' && styles.periodOptionTextSelected]}>3개월</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodOption, periodInput === '6개월' && styles.periodOptionSelected]}
                    onPress={() => handlePeriodSelect('6개월')}
                  >
                    <Text style={[styles.periodOptionText, periodInput === '6개월' && styles.periodOptionTextSelected]}>6개월</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodOption, periodInput === '9개월' && styles.periodOptionSelected]}
                    onPress={() => handlePeriodSelect('9개월')}
                  >
                    <Text style={[styles.periodOptionText, periodInput === '9개월' && styles.periodOptionTextSelected]}>9개월</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodOption, periodInput === '1년' && styles.periodOptionSelected]}
                    onPress={() => handlePeriodSelect('1년')}
                  >
                    <Text style={[styles.periodOptionText, periodInput === '1년' && styles.periodOptionTextSelected]}>1년</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.periodOption, (periodInput === '직접설정' || isCustomPeriod) && styles.periodOptionSelected]}
                    onPress={() => handlePeriodSelect('직접설정')}
                  >
                    <Text style={[styles.periodOptionText, (periodInput === '직접설정' || isCustomPeriod) && styles.periodOptionTextSelected]}>직접 설정</Text>
                  </TouchableOpacity>
                </View>
                
                {/* 직접 설정 시 날짜 입력 필드 */}
                {isCustomPeriod && (
                  <View style={styles.dateInputContainer}>
                    <View style={styles.dateFieldContainer}>
                      <Text style={styles.dateFieldLabel}>시작 날짜</Text>
                      <TouchableOpacity 
                        style={styles.dateField}
                        onPress={() => handleDateFieldPress('start')}
                      >
                        <Text style={styles.dateFieldText}>{startDate}</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.dateSeparator}>~</Text>
                    
                    <View style={styles.dateFieldContainer}>
                      <Text style={styles.dateFieldLabel}>종료 날짜</Text>
                      <TouchableOpacity 
                        style={styles.dateField}
                        onPress={() => handleDateFieldPress('end')}
                      >
                        <Text style={styles.dateFieldText}>{endDate}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
                <Text style={styles.periodGuideText}>
                  기간은 최소 3개월부터 최대 1년까지 설정 가능합니다.
                </Text>
                
                <TouchableOpacity 
                  style={[
                    styles.recommendButton, 
                    (!periodInput && !isCustomPeriod) && styles.recommendButtonDisabled
                  ]} 
                  onPress={handlePeriodConfirm}
                  disabled={!periodInput && !isCustomPeriod}
                >
                  <Text style={styles.recommendButtonText}>슬롯 추천 받기</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // 추천 기준 선택 모달 (false일 때)
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalTitle}>추천 기준 선택</Text>
                
                <View style={styles.infoContainer}>
                  <Text style={styles.infoIcon}>ⓘ</Text>
                  <Text style={styles.infoText}>분석할 거래 내역이 부족해요</Text>
                </View>
                
                <Text style={styles.criteriaQuestion}>어떤 기준으로 추천받을까요?</Text>
                <Text style={styles.criteriaDescription}>
                  아래 기준을 모두 선택할수록 추천이 더 정교해져요.
                </Text>
                
                <View style={styles.criteriaOptions}>
                  <TouchableOpacity 
                    style={[styles.criteriaOption, selectedCriteria.includes('age') && styles.criteriaOptionSelected]}
                    onPress={() => setSelectedCriteria(selectedCriteria.includes('age') ? selectedCriteria.replace('age,', '').replace(',age', '').replace('age', '') : selectedCriteria + (selectedCriteria ? ',age' : 'age'))}
                  >
                    <Text style={[styles.criteriaText, selectedCriteria.includes('age') && styles.criteriaTextSelected]}>
                      {selectedCriteria.includes('age') ? '✓' : ''} 비슷한 연령대
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.criteriaOption, selectedCriteria.includes('income') && styles.criteriaOptionSelected]}
                    onPress={() => setSelectedCriteria(selectedCriteria.includes('income') ? selectedCriteria.replace('income,', '').replace(',income', '').replace('income', '') : selectedCriteria + (selectedCriteria ? ',income' : 'income'))}
                  >
                    <Text style={[styles.criteriaText, selectedCriteria.includes('income') && styles.criteriaTextSelected]}>
                      {selectedCriteria.includes('income') ? '✓' : ''} 비슷한 수입대
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.criteriaOption, selectedCriteria.includes('gender') && styles.criteriaOptionSelected]}
                    onPress={() => setSelectedCriteria(selectedCriteria.includes('gender') ? selectedCriteria.replace('gender,', '').replace(',gender', '').replace('gender', '') : selectedCriteria + (selectedCriteria ? ',gender' : 'gender'))}
                  >
                    <Text style={[styles.criteriaText, selectedCriteria.includes('gender') && styles.criteriaTextSelected]}>
                      {selectedCriteria.includes('gender') ? '✓' : ''} 같은 성별
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={[styles.recommendButton, !selectedCriteria && styles.recommendButtonDisabled]} 
                  onPress={handleCriteriaConfirm}
                  disabled={!selectedCriteria}
                >
                  <Text style={styles.recommendButtonText}>슬롯 추천 받기</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 날짜 선택기 모달 */}
      <Modal
        visible={isDatePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDatePickerClose}
      >
        <TouchableOpacity 
          style={styles.datePickerOverlay} 
          activeOpacity={1} 
          onPress={handleDatePickerClose}
        >
          <TouchableOpacity 
            style={styles.datePickerContainer} 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* 핸들 바 */}
            <View style={styles.datePickerHandle} />
            
            <View style={styles.datePickerHeader}>
              <View style={{ width: 30 }} />
              <Text style={styles.datePickerTitle}>
                {selectedDateType === 'start' ? '시작 날짜' : '종료 날짜'}
              </Text>
              <TouchableOpacity onPress={handleDatePickerClose}>
                <Text style={styles.datePickerCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.datePickerContent}>
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>년</Text>
                <View style={styles.pickerContainer}>
                  {/* <Picker
                    selectedValue={selectedYear}
                    onValueChange={handleYearChange}
                    style={styles.picker}
                  >
                    {Array.from({ length: 6 }, (_, i) => 2020 + i).map(year => (
                      <Picker.Item key={year} label={`${year}년`} value={year} />
                    ))}
                  </Picker> */}
                  <Text style={styles.placeholderText}>년도 선택 (Picker 설치 후 활성화)</Text>
                </View>
              </View>
              
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>월</Text>
                <View style={styles.pickerContainer}>
                  {/* <Picker
                    selectedValue={selectedMonth}
                    onValueChange={handleMonthChange}
                    style={styles.picker}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <Picker.Item key={month} label={`${month}월`} value={month} />
                    ))}
                  </Picker> */}
                  <Text style={styles.placeholderText}>월 선택 (Picker 설치 후 활성화)</Text>
                </View>
              </View>
              
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>일</Text>
                <View style={styles.pickerContainer}>
                  {/* <Picker
                    selectedValue={selectedDay}
                    onValueChange={handleDayChange}
                    style={styles.picker}
                  >
                    {Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1).map(day => (
                      <Picker.Item key={day} label={`${day}일`} value={day} />
                    ))}
                  </Picker> */}
                  <Text style={styles.placeholderText}>일 선택 (Picker 설치 후 활성화)</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.datePickerConfirmButton} 
              onPress={handleDateConfirm}
            >
              <Text style={styles.datePickerConfirmText}>확인</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  header: {
    marginBottom: 20,
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
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    color: '#111827',
  },
  imageContainer: {
    width: 300,
    height: 200,
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleEllipsbackImage: {
    width: 300,
    height: 300,
    position: 'absolute',
    zIndex: 1,
    top: -50,
    left: -5,
  },
  dashboardImage: {
    width: 400,
    height: 250,
    position: 'absolute',
    zIndex: 2,
    top: -50,
    left: -60,
  },
  circlechartImage: {
    width: 120,
    height: 120,
    position: 'absolute',
    zIndex: 3,
    top: 60,
    left: 160,
  },
  description1: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: 16,
  },
  description2: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: 24,
    marginBottom: 40,
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
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
  // 기간 선택 모달 스타일
  periodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  periodOption: {
    width: '18%',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginBottom: 8,
  },
  periodOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  periodOptionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
  periodOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  periodGuideText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  // 추천 기준 선택 모달 스타일
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoIcon: {
    fontSize: 16,
    color: '#3B82F6',
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  criteriaQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  criteriaDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  criteriaOptions: {
    marginBottom: 24,
  },
  criteriaOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  criteriaOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  criteriaText: {
    fontSize: 16,
    color: '#374151',
  },
  criteriaTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // 공통 버튼 스타일
  recommendButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  recommendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  recommendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // 날짜 입력 필드 스타일
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  dateFieldContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateFieldLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  dateField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateFieldText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  dateSeparator: {
    fontSize: 18,
    color: '#6B7280',
    marginHorizontal: 16,
    fontWeight: '600',
  },
  // 날짜 선택기 모달 스타일
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  datePickerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  datePickerCloseButton: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '600',
    padding: 8,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  datePickerContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    position: 'relative',
  },
  datePickerColumn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  datePickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  pickerContainer: {
    height: 200,
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  picker: {
    height: 200,
    width: '100%',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 80,
  },
  datePickerConfirmButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  datePickerConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
