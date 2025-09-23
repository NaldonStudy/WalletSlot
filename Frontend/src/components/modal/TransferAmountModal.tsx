import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import BottomModal from "@/src/components/common/BottomModal";

type TransferMode = 'increase' | 'decrease';

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedSlotName?: string;
  transferAmount: string;
  setTransferAmount: (val: string) => void;
  onConfirm: (mode: TransferMode, amount: number) => void;
};

export default function TransferAmountModal({
  visible,
  onClose,
  selectedSlotName,
  transferAmount,
  setTransferAmount,
  onConfirm,
}: Props) {
  const [transferMode, setTransferMode] = useState<TransferMode>('increase');
  const amount = Number(transferAmount.replace(/,/g, '')) || 0;

  // 숫자만 추출하고 천 단위 콤마 포맷팅
  const formatAmount = (value: string) => {
    // 숫자가 아닌 문자 제거
    const numbersOnly = value.replace(/[^0-9]/g, '');
    // 천 단위 콤마 추가
    return numbersOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatAmount(value);
    setTransferAmount(formatted);
  };

  const handleModeChange = (mode: TransferMode) => {
    setTransferMode(mode);
    setTransferAmount(''); // 모드 변경 시 금액 초기화
  };

  const handleConfirm = () => {
    if (amount > 0) {
      onConfirm(transferMode, amount);
    }
  };

  return (
    <BottomModal visible={visible} onClose={onClose}>
      <Text style={styles.title}>예산 변경</Text>
      <Text style={styles.subtitle}>
        {selectedSlotName ? `${selectedSlotName} 슬롯과의 예산 이동` : ""}
      </Text>

      {/* 모드 선택 버튼 */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            transferMode === 'increase' && styles.modeButtonActive
          ]}
          onPress={() => handleModeChange('increase')}
        >
          <Text style={[
            styles.modeButtonText,
            transferMode === 'increase' && styles.modeButtonTextActive
          ]}>
            예산 증액
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeButton,
            transferMode === 'decrease' && styles.modeButtonActive
          ]}
          onPress={() => handleModeChange('decrease')}
        >
          <Text style={[
            styles.modeButtonText,
            transferMode === 'decrease' && styles.modeButtonTextActive
          ]}>
            예산 축소
          </Text>
        </TouchableOpacity>
      </View>

      {/* 금액 입력 */}
      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>
          {transferMode === 'increase' ? '증액할 금액' : '축소할 금액'}
        </Text>
        <TextInput
          style={styles.input}
          value={transferAmount}
          onChangeText={handleAmountChange}
          placeholder="금액 입력"
          keyboardType="numeric"
        />
      </View>

      {/* 빠른 금액 선택 버튼 */}
      <View style={styles.quickAmountRow}>
        {[10000, 50000, 100000].map((quickAmount) => (
          <TouchableOpacity
            key={quickAmount}
            style={styles.quickAmountButton}
            onPress={() => setTransferAmount(quickAmount.toLocaleString())}
          >
            <Text style={styles.quickAmountText}>
              {quickAmount.toLocaleString()}원
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 확인 버튼 */}
      <TouchableOpacity 
        style={[
          styles.button,
          amount <= 0 && styles.buttonDisabled
        ]} 
        onPress={handleConfirm}
        disabled={amount <= 0}
      >
        <Text style={styles.buttonText}>
          {transferMode === 'increase' ? '예산 증액' : '예산 축소'}
        </Text>
      </TouchableOpacity>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  title: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 8,
    textAlign: "center"
  },
  subtitle: { 
    marginBottom: 20, 
    color: "#6B7280",
    textAlign: "center",
    fontSize: 14
  },
  modeSelector: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: "#3B82F6",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  modeButtonTextActive: {
    color: "white",
  },
  amountSection: {
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "right",
    backgroundColor: "white",
  },
  quickAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  quickAmountButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: { 
    color: "white", 
    fontWeight: "600",
    fontSize: 16
  },
});
