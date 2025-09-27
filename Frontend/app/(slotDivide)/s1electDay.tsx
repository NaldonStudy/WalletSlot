import { ThemedText } from '@/components/ThemedText';
import { useSlotDivideStore } from '@/src/store/slotDivideStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function S1electDayScreen() {
  const [selectedDay, setSelectedDay] = useState('');
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
  
  // Zustand 스토어
  const { setBaseDay } = useSlotDivideStore();

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
  };

  const handleNext = () => {
    if (selectedDay) {
      console.log('선택된 기준일:', selectedDay);
      // 스토어에 기준일 저장
      setBaseDay(selectedDay);
      router.replace('/(slotDivide)/l2oading' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>예산 편성 기준일을 선택해주세요.</ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>기준일</ThemedText>
            <ThemedText style={styles.monthlyText}>
              {selectedDay ? `매월 ${selectedDay}일` : '매월'}
            </ThemedText>
          </View>

          <View style={styles.calendarBox}>
            <TouchableOpacity 
              style={styles.calendarHeader}
              onPress={() => setIsCalendarExpanded(!isCalendarExpanded)}
            >
              <ThemedText style={styles.calendarHeaderText}>기준일 선택</ThemedText>
              <ThemedText style={[
                styles.calendarHeaderIcon,
                !isCalendarExpanded && styles.calendarHeaderIconRotated
              ]}>
                ^
              </ThemedText>
            </TouchableOpacity>
            {isCalendarExpanded && (
              <View style={styles.calendarContainer}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      selectedDay === day.toString() && styles.selectedDay
                    ]}
                    onPress={() => handleDaySelect(day.toString())}
                  >
                    <ThemedText style={[
                      styles.dayText,
                      selectedDay === day.toString() && styles.selectedDayText
                    ]}>
                      {day}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedDay && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!selectedDay}
          >
            <ThemedText style={[
              styles.nextButtonText,
              !selectedDay && styles.nextButtonTextDisabled
            ]}>
              다음
            </ThemedText>
          </TouchableOpacity>
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
  },
  header: {
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  monthlyText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  calendarBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginTop: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  calendarHeaderIcon: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  calendarHeaderIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayButton: {
    width: (width - 80) / 7,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    marginRight: 4,
  },
  selectedDay: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    borderRadius: 16,
  },
  dayText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
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
