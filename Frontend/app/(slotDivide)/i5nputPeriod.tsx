import { useSlotDivideStore } from '@/src/store/slotDivideStore';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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
  
  // 초기 날짜 설정: 종료날짜는 오늘, 시작날짜는 3개월 전
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };
  
  const [startDate, setStartDate] = useState(formatDate(threeMonthsAgo));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [selectedDateType, setSelectedDateType] = useState<'start' | 'end'>('start');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // 날짜 선택 상태 (상세 설정용)
  const [selectedYear, setSelectedYear] = useState(threeMonthsAgo.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(threeMonthsAgo.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(threeMonthsAgo.getDate());
  
  // 리스트 모달 상태
  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [listType, setListType] = useState<'year' | 'month' | 'day'>('year');
  const [listData, setListData] = useState<number[]>([]);

  // 연도/월/일 데이터
  const years = Array.from({ length: 4 }, (_, i) => today.getFullYear() - 3 + i); // 이번년도 -3년 ~ 이번년도
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const isLeapYear = (year: number) =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  const getDaysInMonth = (year: number, month: number) => {
    const base = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && isLeapYear(year)) return 29;
    return base[month - 1];
  };

  const days = useMemo(() => {
    const maxDays = getDaysInMonth(selectedYear, selectedMonth);
    return Array.from({ length: maxDays }, (_, i) => i + 1);
  }, [selectedYear, selectedMonth]);

  // 월 변경 시 일 자동 보정
  useEffect(() => {
    const max = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > max) {
      setSelectedDay(max);
    }
  }, [selectedYear, selectedMonth]);

  // 진입 애니메이션
  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    const float = (v: Animated.Value) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: -8, duration: 2000, useNativeDriver: true }),
          Animated.timing(v, { toValue: 8, duration: 2000, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      );
    const dash = float(dashboardFloatY);
    const pie = float(circlechartFloatY);
    dash.start();
    setTimeout(() => pie.start(), 600);
    return () => {
      dash.stop();
      pie.stop();
    };
  }, []);

  const handleGoBack = () => router.back();

  const handleNext = () => {
    const hasEnoughData = Math.random() > 0.5;
    if (hasEnoughData) {
      setModalType('period');
      setIsModalVisible(true);
    } else {
      setModalType('criteria');
      setIsModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setPeriodInput('');
    setSelectedCriteria('');
    setIsCustomPeriod(false);
    setIsListModalVisible(false);
  };

  const handlePeriodSelect = (period: string) => {
    if (period === '직접설정') setIsCustomPeriod(true);
    else {
      setPeriodInput(period);
      setIsCustomPeriod(false);
    }
  };

  // 날짜 필드 클릭
  const handleDateFieldPress = (type: 'start' | 'end') => {
    setSelectedDateType(type);
    const parts = (type === 'start' ? startDate : endDate).split('.').map(Number);
    const [y, m, d] = parts as [number, number, number];
    setSelectedYear(y);
    setSelectedMonth(m);
    setSelectedDay(d);
  };

  // 입력칸 클릭 핸들러
  const handleInputPress = (type: 'year' | 'month' | 'day') => {
    setListType(type);
    if (type === 'year') {
      setListData(years);
    } else if (type === 'month') {
      setListData(months);
    } else {
      setListData(days);
    }
    setIsListModalVisible(true);
  };

  // 리스트 아이템 선택
  const handleListSelect = (value: number) => {
    if (listType === 'year') {
      setSelectedYear(value);
    } else if (listType === 'month') {
      setSelectedMonth(value);
    } else {
      setSelectedDay(value);
    }
    setIsListModalVisible(false);
  };

  // 날짜 확인(메모리에 저장)
  const handleDateConfirm = () => {
    const formatted = `${selectedYear}.${String(selectedMonth).padStart(2, '0')}.${String(selectedDay).padStart(2, '0')}`;
    if (selectedDateType === 'start') setStartDate(formatted);
    else setEndDate(formatted);
  };

  const handlePeriodConfirm = () => {
    if (isCustomPeriod) setPeriod(`${startDate} ~ ${endDate}`);
    else if (periodInput.trim()) setPeriod(periodInput);
    else return;
    setIsModalVisible(false);
    router.push('/(slotDivide)/r6eady' as any);
  };

  const handleCriteriaConfirm = () => {
    if (!selectedCriteria) return;
    setPeriod(selectedCriteria);
    setIsModalVisible(false);
    router.push('/(slotDivide)/r6eady' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Text style={styles.backButtonText}>← 뒤로</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.content, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }]}>
            <Text style={styles.title}>분석 기간을 골라볼까요?</Text>

            {/* 이미지 레이어들 */}
            <View style={styles.imageContainer}>
              <Image source={require('@/src/assets/images/backgroundstyle/circleEllipsback.png')} style={styles.circleEllipsbackImage} resizeMode="contain" />
              <Animated.Image
                source={require('@/src/assets/images/divideImage/dashboard.png')}
                style={[styles.dashboardImage, { transform: [{ translateY: dashboardFloatY }] }]}
                resizeMode="contain"
              />
              <Animated.Image
                source={require('@/src/assets/images/divideImage/circlechart.png')}
                style={[styles.circlechartImage, { transform: [{ translateY: circlechartFloatY }] }]}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.description1}>최근 거래를 살펴보고 맞춤 예산 가이드를 만들어드릴게요.</Text>
            <Text style={styles.description2}>기록이 적다면, 비슷한 수입대와 연령대/성별 기준으로 AI가 추천해드려요.</Text>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>다음</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      {/* 기간/기준 모달 */}
      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            {modalType === 'period' ? (
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalTitle}>기간 선택</Text>

                <View style={styles.periodOptions}>
                  {['3개월', '6개월', '9개월', '1년', '직접설정'].map((label) => {
                    const selected = periodInput === label || (label === '직접설정' && isCustomPeriod);
                    return (
                      <TouchableOpacity
                        key={label}
                        style={[styles.periodOption, selected && styles.periodOptionSelected]}
                        onPress={() => handlePeriodSelect(label)}
                      >
                        <Text style={[styles.periodOptionText, selected && styles.periodOptionTextSelected]}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {isCustomPeriod && (
                  <View style={styles.dateInputContainer}>
                    <View style={styles.dateFieldContainer}>
                      <Text style={styles.dateFieldLabel}>시작 날짜</Text>
                      <TouchableOpacity style={styles.dateField} onPress={() => {
                        handleDateFieldPress('start');
                        setIsDatePickerVisible(true);
                      }}>
                        <Text style={styles.dateFieldText}>{startDate}</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.dateSeparator}>~</Text>
                    <View style={styles.dateFieldContainer}>
                      <Text style={styles.dateFieldLabel}>종료 날짜</Text>
                      <TouchableOpacity style={styles.dateField} onPress={() => {
                        handleDateFieldPress('end');
                        setIsDatePickerVisible(true);
                      }}>
                        <Text style={styles.dateFieldText}>{endDate}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <Text style={styles.periodGuideText}>기간은 최소 3개월부터 최대 1년까지 설정 가능합니다.</Text>

                <TouchableOpacity
                  style={[styles.recommendButton, !periodInput && !isCustomPeriod && styles.recommendButtonDisabled]}
                  onPress={handlePeriodConfirm}
                  disabled={!periodInput && !isCustomPeriod}
                >
                  <Text style={styles.recommendButtonText}>슬롯 추천 받기</Text>
                </TouchableOpacity>
              </View>
            ) : (
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
                <Text style={styles.criteriaDescription}>아래 기준을 모두 선택할수록 추천이 더 정교해져요.</Text>

                <View style={styles.criteriaOptions}>
                  {['age', 'income', 'gender'].map((k) => {
                    const selected = selectedCriteria.includes(k);
                    const label = k === 'age' ? '비슷한 연령대' : k === 'income' ? '비슷한 수입대' : '같은 성별';
                    return (
                      <TouchableOpacity
                        key={k}
                        style={[styles.criteriaOption, selected && styles.criteriaOptionSelected]}
                        onPress={() =>
                          setSelectedCriteria((prev) =>
                            prev.includes(k) ? prev.replace(/(^|,)${k}(,|$)/, (m, a, b) => (a && b ? ',' : '')).replace(/^,|,$/g, '') : prev ? `${prev},${k}` : k
                          )
                        }
                      >
                        <Text style={[styles.criteriaText, selected && styles.criteriaTextSelected]}>{selected ? '✓ ' : ''}{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
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

      {/* 상세 날짜 설정 모달 */}
      <Modal visible={isDatePickerVisible} transparent animationType="slide" onRequestClose={() => setIsDatePickerVisible(false)}>
        <View style={styles.datePickerOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsDatePickerVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHandle} />
            
            <View style={styles.datePickerHeader}>
              <View style={{ width: 30 }} />
              <Text style={styles.datePickerTitle}>
                {selectedDateType === 'start' ? '시작 날짜 설정' : '종료 날짜 설정'}
              </Text>
              <TouchableOpacity onPress={() => setIsDatePickerVisible(false)}>
                <Text style={styles.datePickerCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerContent}>
              <Text style={styles.datePickerSubtitle}>날짜를 선택해주세요</Text>
              
              <View style={styles.dateInputRow}>
                <View style={styles.dateInputColumn}>
                  <Text style={styles.dateInputLabel}>년</Text>
                  <TouchableOpacity style={styles.dateInputField} onPress={() => handleInputPress('year')}>
                    <Text style={styles.dateInputText}>{selectedYear}년</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.dateInputColumn}>
                  <Text style={styles.dateInputLabel}>월</Text>
                  <TouchableOpacity style={styles.dateInputField} onPress={() => handleInputPress('month')}>
                    <Text style={styles.dateInputText}>{selectedMonth}월</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.dateInputColumn}>
                  <Text style={styles.dateInputLabel}>일</Text>
                  <TouchableOpacity style={styles.dateInputField} onPress={() => handleInputPress('day')}>
                    <Text style={styles.dateInputText}>{selectedDay}일</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.datePickerConfirmButton} onPress={() => {
                handleDateConfirm();
                setIsDatePickerVisible(false);
              }}>
                <Text style={styles.datePickerConfirmText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 리스트 선택 모달 */}
      <Modal visible={isListModalVisible} transparent animationType="slide" onRequestClose={() => setIsListModalVisible(false)}>
        <View style={styles.listModalOverlay}>
          <TouchableWithoutFeedback onPress={() => setIsListModalVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={styles.listModalContainer}>
            <View style={styles.listModalHandle} />
            
            <View style={styles.listModalHeader}>
              <View style={{ width: 30 }} />
              <Text style={styles.listModalTitle}>
                {listType === 'year' ? '년도 선택' : listType === 'month' ? '월 선택' : '일 선택'}
              </Text>
              <TouchableOpacity onPress={() => setIsListModalVisible(false)}>
                <Text style={styles.listModalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
              {listData.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.listItem}
                  onPress={() => handleListSelect(item)}
                >
                  <Text style={styles.listItemText}>
                    {listType === 'year' ? `${item}년` : listType === 'month' ? `${item}월` : `${item}일`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 64 },
  header: { marginBottom: 20 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12 },
  backButtonText: { fontSize: 16, color: '#3B82F6', fontWeight: '500' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 40, color: '#111827' },

  imageContainer: { width: 300, height: 200, position: 'relative', marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
  circleEllipsbackImage: { width: 300, height: 300, position: 'absolute', zIndex: 1, top: -50, left: -5 },
  dashboardImage: { width: 400, height: 250, position: 'absolute', zIndex: 2, top: -50, left: -60 },
  circlechartImage: { width: 120, height: 120, position: 'absolute', zIndex: 3, top: 60, left: 160 },

  description1: { fontSize: 16, color: '#000000', fontWeight: '700', textAlign: 'left', lineHeight: 24, marginBottom: 16 },
  description2: { fontSize: 16, color: '#000000', fontWeight: '700', textAlign: 'left', lineHeight: 24, marginBottom: 40 },
  nextButton: { backgroundColor: '#3B82F6', paddingVertical: 16, paddingHorizontal: 60, borderRadius: 12, width: '100%', alignItems: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  // 모달
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalContent: { paddingHorizontal: 20, paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 24 },
  closeButton: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 18, color: '#666666', fontWeight: '600' },

  // 기간
  periodOptions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
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
  periodOptionSelected: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  periodOptionText: { fontSize: 12, color: '#374151', fontWeight: '500', textAlign: 'center' },
  periodOptionTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  periodGuideText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 24 },

  // 기준
  infoContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 8, marginBottom: 20 },
  infoIcon: { fontSize: 16, color: '#3B82F6', marginRight: 8 },
  infoText: { fontSize: 14, color: '#3B82F6', fontWeight: '500' },
  criteriaQuestion: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  criteriaDescription: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  criteriaOptions: { marginBottom: 24 },
  criteriaOption: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  criteriaOptionSelected: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  criteriaText: { fontSize: 16, color: '#374151' },
  criteriaTextSelected: { color: '#FFFFFF', fontWeight: '600' },

  // 공통 버튼
  recommendButton: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  recommendButtonDisabled: { backgroundColor: '#E5E7EB' },
  recommendButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  // 날짜 입력 필드
  dateInputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 20, paddingHorizontal: 10 },
  dateFieldContainer: { flex: 1, alignItems: 'center' },
  dateFieldLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: '500' },
  dateField: {
    backgroundColor: '#F9FAFB',
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
  dateFieldText: { fontSize: 16, color: '#111827', fontWeight: '500' },
  dateSeparator: { fontSize: 18, color: '#6B7280', marginHorizontal: 16, fontWeight: '600' },

  // 상세 날짜 설정 모달
  datePickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  datePickerContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
  datePickerHandle: { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  datePickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  datePickerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  datePickerCloseButton: { fontSize: 18, color: '#666666', fontWeight: '600', padding: 8 },
  datePickerContent: { paddingHorizontal: 20, paddingVertical: 20 },
  datePickerSubtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 30 },
  dateInputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  dateInputColumn: { flex: 1, alignItems: 'center', marginHorizontal: 5 },
  dateInputLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8, fontWeight: '500' },
  dateInputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateInputText: { fontSize: 16, color: '#111827', fontWeight: '500' },
  datePickerConfirmButton: { backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  datePickerConfirmText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  // 리스트 모달
  listModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  listModalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' },
  listModalHandle: { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  listModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  listModalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  listModalCloseButton: { fontSize: 18, color: '#666666', fontWeight: '600', padding: 8 },
  listContainer: { maxHeight: 300, paddingHorizontal: 20 },
  listItem: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  listItemText: { fontSize: 16, color: '#111827', textAlign: 'center' },
});