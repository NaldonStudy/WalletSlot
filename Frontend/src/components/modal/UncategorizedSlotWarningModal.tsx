import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Spacing } from "@/src/constants/theme";

type UncategorizedSlotWarningModalProps = {
  visible: boolean;
  slotName: string;
  onCancel: () => void;
  onConfirm: () => void;
  theme: any;
};

export default function UncategorizedSlotWarningModal({
  visible,
  slotName,
  onCancel,
  onConfirm,
  theme,
}: UncategorizedSlotWarningModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background.primary }]}>
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              미분류 슬롯 예산 변경
            </Text>
            <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
              <Text style={[styles.slotName, { color: theme.colors.text.primary }]}>
                {slotName}
              </Text>
              슬롯은 비상 상황을 대비한 자금이에요.
            </Text>
            <Text style={[styles.question, { color: theme.colors.text.secondary }]}>
              꼭 필요한 경우에만 이동하시길 권장합니다.
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: '#3B82F6' }]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>
                취소
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: theme.colors.background.secondary }]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmButtonText, { color: theme.colors.text.secondary }]}>
                변경
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContainer: {
    borderRadius: 16,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 320,
  },
  content: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  slotName: {
    fontWeight: '600',
  },
  question: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.base,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    // backgroundColor는 props에서 설정
  },
  confirmButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
