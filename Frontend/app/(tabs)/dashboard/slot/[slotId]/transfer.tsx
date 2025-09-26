import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams, router } from "expo-router";
import { useSlotStore } from "@/src/store/useSlotStore";
import { useColorScheme } from "react-native";
import { themes, Spacing } from "@/src/constants/theme";
import { useSlots } from "@/src/hooks/slots/useSlots";
import SlotInfoCard from "@/src/components/slot/SlotInfoCard";

type TransferMode = 'increase' | 'decrease';

export default function TransferScreen() {
  const {
    slotId,
    fromSlotId,
    fromSlotName,
    fromSlotBudget,
    fromSlotRemaining
  } = useLocalSearchParams<{
    slotId: string;
    fromSlotId: string;
    fromSlotName: string;
    fromSlotBudget: string;
    fromSlotRemaining: string;
  }>();

  const { selectedSlot } = useSlotStore();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  const [newBudget, setNewBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 현재 슬롯 정보
  const currentSlot = selectedSlot;

  // 선택된 "from" 슬롯 정보 (파라미터에서 받아온 정보)
  const selectedFromSlot = {
    slotId: fromSlotId,
    slotName: fromSlotName,
    budget: Number(fromSlotBudget) || 0,
    remaining: Number(fromSlotRemaining) || 0,
    isSaving: false, // TODO: 실제 데이터에서 가져와야 함
  };

  // 새로운 예산 금액
  const newBudgetAmount = Number(newBudget.replace(/,/g, '')) || 0;

  // 예산 차이 계산
  const budgetDifference = newBudgetAmount - (currentSlot?.currentBudget || 0);

  // 숫자만 추출하고 천 단위 콤마 포맷팅
  const formatAmount = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    return numbersOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleBudgetChange = (value: string) => {
    const formatted = formatAmount(value);
    setNewBudget(formatted);
  };

  const handleTransfer = async () => {
    if (!currentSlot) {
      Alert.alert('오류', '슬롯 정보를 찾을 수 없습니다.');
      return;
    }

    if (newBudgetAmount <= 0) {
      Alert.alert('오류', '올바른 예산을 입력해주세요.');
      return;
    }

    if (newBudgetAmount === currentSlot.currentBudget) {
      Alert.alert('알림', '현재 예산과 동일합니다.');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: API 호출로 실제 예산 변경
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Store 업데이트 (실제 구현 시)
      console.log('예산 변경:', {
        currentSlot: currentSlot.slotId,
        newBudget: newBudgetAmount,
        fromSlot: selectedFromSlot.slotId,
        budgetDifference,
        action: budgetDifference > 0 ? '증액' : '축소'
      });

      // 성공 시 바로 이전 화면으로 돌아가기
      router.back();
    } catch (error) {
      Alert.alert('오류', '예산 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentSlot) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>슬롯 정보를 찾을 수 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <KeyboardAwareScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        contentContainerStyle={styles.scrollContent}
      >

        {/* 슬롯 정보 및 예상 결과 */}
        <View style={[styles.slotsInfoSection, { backgroundColor: theme.colors.background.secondary }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            슬롯 정보 및 예상 결과
          </Text>

          {/* 현재 슬롯 */}
          <SlotInfoCard
            slotName={currentSlot.name}
            badgeText="현재"
            badgeColor="#3B82F6"
            currentBudget={currentSlot.currentBudget}
            currentRemaining={currentSlot.remainingBudget}
            newBudget={newBudgetAmount > 0 && budgetDifference !== 0 ? newBudgetAmount : undefined}
            newRemaining={newBudgetAmount > 0 && budgetDifference !== 0 ? currentSlot.remainingBudget + budgetDifference : undefined}
            showChanges={newBudgetAmount > 0 && budgetDifference !== 0}
            isSaving={currentSlot.isSaving}
            theme={theme}
          />

          {/* 예산을 이동할 슬롯 */}
          <SlotInfoCard
            slotName={selectedFromSlot.slotName}
            badgeText="이동 대상"
            badgeColor="#10B981"
            currentBudget={selectedFromSlot.budget}
            currentRemaining={selectedFromSlot.remaining}
            newBudget={newBudgetAmount > 0 && budgetDifference !== 0 ? selectedFromSlot.budget - budgetDifference : undefined}
            newRemaining={newBudgetAmount > 0 && budgetDifference !== 0 ? selectedFromSlot.remaining - budgetDifference : undefined}
            showChanges={newBudgetAmount > 0 && budgetDifference !== 0}
            isSaving={selectedFromSlot.isSaving}
            theme={theme}
          />

          {/* 새로운 예산 입력 */}
          <View style={styles.amountSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              새로운 예산
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                value={newBudget}
                onChangeText={handleBudgetChange}
                placeholder="새로운 예산 입력"
                placeholderTextColor={theme.colors.text.tertiary}
                keyboardType="numeric"
              />
              <Text style={[styles.currencyText, { color: theme.colors.text.secondary }]}>
                원
              </Text>
            </View>
          </View>

          {/* 예산 차이 요약 */}
          {newBudgetAmount > 0 && budgetDifference !== 0 && (
            <View style={[
              styles.differenceSection,
              budgetDifference > 0 ? styles.increaseSection : styles.decreaseSection
            ]}>
              <Text style={[
                styles.differenceText,
                budgetDifference > 0 ? styles.increaseText : styles.decreaseText
              ]}>
                {budgetDifference > 0 ? '증액' : '축소'}: {Math.abs(budgetDifference ?? 0).toLocaleString()}원
              </Text>
              <Text style={styles.differenceSubtext}>
                {budgetDifference > 0
                  ? `${selectedFromSlot.slotName} 슬롯에서 이 금액만큼 차감됩니다`
                  : `${selectedFromSlot.slotName} 슬롯에 이 금액만큼 추가됩니다`
                }
              </Text>
            </View>
          )}
        </View>



        {/* 빠른 예산 선택 */}
        <View style={styles.quickAmountSection}>
          <View style={styles.quickAmountRow}>
            {[
              currentSlot.currentBudget * 0.8, // 20% 감소
              currentSlot.currentBudget * 1.2, // 20% 증가
              currentSlot.currentBudget * 1.5, // 50% 증가
            ].map((quickAmount, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickAmountButton, { backgroundColor: theme.colors.background.secondary }]}
                onPress={() => setNewBudget(Math.round(quickAmount ?? 0).toLocaleString())}
              >
                <Text style={[styles.quickAmountText, { color: theme.colors.text.primary }]}>
                  {Math.round(quickAmount ?? 0).toLocaleString()}원
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </KeyboardAwareScrollView>

      {/* 하단 버튼 */}
      <View style={[styles.buttonContainer, { backgroundColor: theme.colors.background.primary }]}>
        <TouchableOpacity
          style={[
            styles.button,
            (newBudgetAmount <= 0 || newBudgetAmount === currentSlot.currentBudget) && styles.buttonDisabled
          ]}
          onPress={handleTransfer}
          disabled={newBudgetAmount <= 0 || newBudgetAmount === currentSlot.currentBudget || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '처리 중...' : '예산 변경'}
          </Text>
        </TouchableOpacity>
      </View>
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
  scrollContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  currentSlotSection: {
    padding: Spacing.base,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.base,
  },
  slotInfo: {
    gap: Spacing.sm,
  },
  slotName: {
    fontSize: 20,
    fontWeight: '700',
  },
  slotDetails: {
    gap: Spacing.xs,
  },
  slotDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotDetailLabel: {
    fontSize: 14,
  },
  slotDetailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  slotsInfoSection: {
    padding: Spacing.base,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  fromSlotSection: {
    marginBottom: Spacing.lg,
  },
  slotList: {
    gap: Spacing.sm,
  },
  slotCard: {
    borderRadius: 12,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSlotCard: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  slotCardContent: {
    gap: Spacing.sm,
  },
  slotCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotCardName: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  slotCardDetails: {
    gap: Spacing.xs,
  },
  slotCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotCardLabel: {
    fontSize: 14,
  },
  slotCardValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  modeSection: {
    marginBottom: Spacing.lg,
  },
  modeSelector: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#3B82F6",
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  modeButtonTextActive: {
    color: "white",
  },
  amountSection: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: Spacing.sm,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  quickAmountSection: {
    marginBottom: Spacing.lg,
  },
  quickAmountRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
  },
  previewSection: {
    padding: Spacing.base,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  previewSlotSection: {
    marginBottom: Spacing.base,
  },
  previewSlotTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  differenceSection: {
    padding: 12,
    borderRadius: 8,
    marginBottom: Spacing.base,
  },
  increaseSection: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  decreaseSection: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  differenceText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  increaseText: {
    color: "#059669",
  },
  decreaseText: {
    color: "#DC2626",
  },
  differenceSubtext: {
    fontSize: 12,
    color: "#6B7280",
  },
  previewInfo: {
    gap: Spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 14,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
