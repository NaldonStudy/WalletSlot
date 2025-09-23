import { Spacing, themes, Typography } from '@/src/constants/theme';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { BottomSheet, BottomSheetProps } from './BottomSheet';

/**
 * 선택 옵션 타입
 */
export interface PickerOption {
  /** 옵션 값 */
  value: string;
  /** 표시될 라벨 */
  label: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

/**
 * 픽커 모달 컴포넌트의 속성 타입
 */
export interface PickerModalProps extends Omit<BottomSheetProps, 'children'> {
  /** 선택 옵션 목록 */
  options: PickerOption[];
  /** 현재 선택된 값 */
  selectedValue?: string;
  /** 선택 완료 콜백 */
  onSelect: (value: string, option: PickerOption) => void;
  /** 선택 취소 콜백 */
  onCancel?: () => void;
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 단일 선택 모드 (선택 즉시 닫기) */
  singleSelect?: boolean;
  /** 검색 가능 여부 */
  searchable?: boolean;
}

/**
 * 표준 픽커 모달 컴포넌트
 * 
 * @description
 * profile/index.tsx의 JobPicker를 기반으로 한 표준 선택 모달입니다.
 * 목록에서 하나의 옵션을 선택할 수 있습니다.
 * 
 * @example
 * ```tsx
 * // 기본 픽커
 * <PickerModal
 *   visible={visible}
 *   title="직업 선택"
 *   options={jobOptions}
 *   selectedValue={selectedJob}
 *   onSelect={(value) => setSelectedJob(value)}
 *   onClose={onClose}
 * />
 * 
 * // 단일 선택 모드
 * <PickerModal
 *   visible={visible}
 *   title="카테고리 선택"
 *   options={categories}
 *   singleSelect
 *   onSelect={handleSelect}
 *   onClose={onClose}
 * />
 * ```
 */
export const PickerModal: React.FC<PickerModalProps> = ({
  visible,
  onClose,
  title = '선택',
  options = [],
  selectedValue,
  onSelect,
  onCancel,
  confirmText = '선택',
  cancelText = '취소',
  singleSelect = false,
  searchable = false,
  testID = 'picker-modal',
  ...bottomSheetProps
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];
  const [tempSelected, setTempSelected] = useState(selectedValue || '');

  useEffect(() => {
    if (visible) {
      setTempSelected(selectedValue || '');
    }
  }, [selectedValue, visible]);

  const handleSelect = (option: PickerOption) => {
    if (option.disabled) return;

    if (singleSelect) {
      // 단일 선택 모드: 선택과 동시에 콜백 호출하고 모달 닫기
      onSelect(option.value, option);
      onClose();
    } else {
      // 다중 단계 모드: 임시 선택만 업데이트
      setTempSelected(option.value);
    }
  };

  const handleConfirm = () => {
    const selectedOption = options.find(opt => opt.value === tempSelected);
    if (selectedOption) {
      onSelect(tempSelected, selectedOption);
    }
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
        <Text style={[styles.cancelText, { color: theme.colors.text.secondary }]}>
          {cancelText}
        </Text>
      </TouchableOpacity>
      
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      
      {!singleSelect && (
        <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
          <Text style={[styles.confirmText, { color: theme.colors.primary[600] }]}>
            {confirmText}
          </Text>
        </TouchableOpacity>
      )}
      
      {singleSelect && <View style={styles.headerButton} />}
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      showHeader={false}
      showHandle={true}
      height="half"
      testID={testID}
      {...bottomSheetProps}
    >
      {renderHeader()}
      
      <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionItem,
              {
                backgroundColor: tempSelected === option.value 
                  ? theme.colors.primary[50] 
                  : 'transparent',
                borderColor: tempSelected === option.value 
                  ? theme.colors.primary[200] 
                  : theme.colors.border.light,
              },
              option.disabled && styles.disabledOption,
            ]}
            onPress={() => handleSelect(option)}
            disabled={option.disabled}
            testID={`${testID}-option-${option.value}`}
          >
            <Text style={[
              styles.optionText,
              {
                color: option.disabled 
                  ? theme.colors.text.tertiary 
                  : tempSelected === option.value 
                    ? theme.colors.primary[700]
                    : theme.colors.text.primary
              }
            ]}>
              {option.label}
            </Text>
            {tempSelected === option.value && (
              <Text style={[styles.checkmark, { color: theme.colors.primary[600] }]}>
                ✓
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    minWidth: 60,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
    textAlign: 'center',
  },
  cancelText: {
    fontSize: Typography.fontSize.base,
  },
  confirmText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'right',
  },
  optionsList: {
    flex: 1,
    paddingTop: Spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: Typography.fontSize.base,
    flex: 1,
  },
  checkmark: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});

export default PickerModal;