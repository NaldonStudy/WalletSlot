import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, themes, Typography } from '@/src/constants/theme';
import { useSlotStore } from '@/src/store/useSlotStore';
import { useSlots } from '@/src/hooks/slots/useSlots';
import EditSlotItem from '@/src/components/slot/EditSlotItem';
import SavingSlotWarningModal from '@/src/components/modal/SavingSlotWarningModal';
import UncategorizedSlotWarningModal from '@/src/components/modal/UncategorizedSlotWarningModal';


export default function EditSlotScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  const { selectedSlot } = useSlotStore();
  const { slots: allSlots } = useSlots(selectedSlot?.accountId);

  const [showSavingWarningModal, setShowSavingWarningModal] = useState(false);
  const [showUncategorizedWarningModal, setShowUncategorizedWarningModal] = useState(false);
  const [pendingSlotId, setPendingSlotId] = useState<string | null>(null);

  // 현재 슬롯을 제외한 다른 슬롯들만 필터링
  const otherSlots = allSlots?.filter(slot => slot.slotId !== selectedSlot?.slotId) || [];

  // 화면이 포커스될 때마다 선택 상태 초기화
  useEffect(() => {
    setPendingSlotId(null);
    setShowSavingWarningModal(false);
    setShowUncategorizedWarningModal(false);
  }, []);

  const handleSelectSlot = (slotId: string) => {
    const selectedSlotInfo = otherSlots.find(slot => slot.slotId === slotId);
    
    // 저축 슬롯인지 확인
    if (selectedSlotInfo?.isSaving) {
      setPendingSlotId(slotId);
      setShowSavingWarningModal(true);
    } 
    // 미분류 슬롯인지 확인
    else if (slotId === "25") {
      setPendingSlotId(slotId);
      setShowUncategorizedWarningModal(true);
    } 
    else {
      // 일반 슬롯이면 바로 이동
      proceedToTransfer(slotId);
    }
  };

  const proceedToTransfer = (slotId: string) => {
    // 선택한 슬롯 정보와 함께 새로운 화면으로 이동
    const selectedSlotInfo = otherSlots.find(slot => slot.slotId === slotId);
    router.push({
      pathname: `/dashboard/slot/${selectedSlot?.slotId}/transfer` as any,
      params: {
        fromSlotId: slotId,
        fromSlotName: selectedSlotInfo?.slotName || '',
        fromSlotBudget: selectedSlotInfo?.budget?.toString() || '0',
        fromSlotRemaining: selectedSlotInfo?.remaining?.toString() || '0',
      }
    });
  };

  const handleSavingWarningConfirm = () => {
    setShowSavingWarningModal(false);
    if (pendingSlotId) {
      proceedToTransfer(pendingSlotId);
      setPendingSlotId(null);
    }
  };

  const handleSavingWarningCancel = () => {
    setShowSavingWarningModal(false);
    setPendingSlotId(null);
  };

  const handleUncategorizedWarningConfirm = () => {
    setShowUncategorizedWarningModal(false);
    if (pendingSlotId) {
      proceedToTransfer(pendingSlotId);
      setPendingSlotId(null);
    }
  };

  const handleUncategorizedWarningCancel = () => {
    setShowUncategorizedWarningModal(false);
    setPendingSlotId(null);
  };

  const handleCancel = () => {
    router.back();
  };

  if (!selectedSlot) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            슬롯 정보를 찾을 수 없습니다.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            슬롯 예산 변경
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            건전한 예산 관리를 위해 다른 소비 Slot에서 차감을 추천드려요!
          </Text>
        </View>

        {/* 현재 슬롯 정보 */}
        <View style={styles.currentSlotSection}>
          <EditSlotItem
            icon={selectedSlot.slotIcon}
            slotName={selectedSlot.slotName}
            budget={selectedSlot.budget}
            remaining={selectedSlot.remaining}
          />
        </View>

        {/* 이동할 슬롯 선택 */}
        <View style={styles.transferSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            예산을 이동할 슬롯을 선택하세요
          </Text>

          {otherSlots.map((slot) => (
            <EditSlotItem
              key={slot.slotId}
              icon={slot.slotIcon}
              slotName={slot.slotName}
              budget={slot.budget}
              remaining={slot.remaining}
              onPress={() => handleSelectSlot(slot.slotId)}
            />
          ))}
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 저축 슬롯 경고 모달 */}
      <SavingSlotWarningModal
        visible={showSavingWarningModal}
        slotName={otherSlots.find(slot => slot.slotId === pendingSlotId)?.slotName || ''}
        onCancel={handleSavingWarningCancel}
        onConfirm={handleSavingWarningConfirm}
        theme={theme}
      />

      {/* 미분류 슬롯 경고 모달 */}
      <UncategorizedSlotWarningModal
        visible={showUncategorizedWarningModal}
        slotName={otherSlots.find(slot => slot.slotId === pendingSlotId)?.slotName || ''}
        onCancel={handleUncategorizedWarningCancel}
        onConfirm={handleUncategorizedWarningConfirm}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  currentSlotSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  transferSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.base,
  },
  slotCard: {
    borderRadius: 12,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSlotCard: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  slotIconText: {
    fontSize: 20,
  },
  slotInfo: {
    flex: 1,
  },
  slotName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  budgetInfo: {
    gap: Spacing.xs,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: 14,
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuButton: {
    padding: Spacing.sm,
  },
  menuDots: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  amountInput: {
    borderRadius: 12,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  currency: {
    fontSize: 16,
  },
  alternativeSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  alternativeButton: {
    alignItems: 'center',
  },
  alternativeText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  bottomSpacer: {
    height: 100,
  },
  buttonContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    borderRadius: 12,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
