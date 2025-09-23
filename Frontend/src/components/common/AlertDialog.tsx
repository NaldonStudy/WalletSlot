import { Spacing, themes, Typography } from '@/src/constants/theme';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Button } from '../Button';
import { CommonModal, CommonModalProps } from './CommonModal';

/**
 * 알림 다이얼로그 컴포넌트의 속성 타입
 */
export interface AlertDialogProps extends Omit<CommonModalProps, 'children' | 'position'> {
  /** 다이얼로그 제목 */
  title: string;
  /** 다이얼로그 메시지 */
  message?: string;
  /** 커스텀 컨텐츠 (message 대신 사용) */
  children?: ReactNode;
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  /** 확인 버튼 콜백 */
  onConfirm?: () => void;
  /** 취소 버튼 콜백 (제공되지 않으면 취소 버튼 숨김) */
  onCancel?: () => void;
  /** 단일 버튼 모드 (확인만) */
  singleButton?: boolean;
  /** 확인 버튼 스타일 */
  confirmVariant?: 'primary' | 'danger';
}

/**
 * 표준 알림 다이얼로그 컴포넌트
 * 
 * @description
 * account-verification.tsx의 모달 스타일을 기반으로 한 표준 알림 다이얼로그입니다.
 * 제목, 메시지, 확인/취소 버튼을 제공합니다.
 * 
 * @example
 * ```tsx
 * // 기본 알림
 * <AlertDialog 
 *   visible={visible}
 *   title="알림"
 *   message="작업이 완료되었습니다."
 *   onClose={onClose}
 *   onConfirm={onClose}
 *   singleButton
 * />
 * 
 * // 확인/취소 다이얼로그
 * <AlertDialog
 *   visible={visible}
 *   title="삭제 확인"
 *   message="정말로 삭제하시겠습니까?"
 *   onClose={onClose}
 *   onConfirm={handleDelete}
 *   onCancel={onClose}
 *   confirmVariant="danger"
 * />
 * ```
 */
export const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  onClose,
  title,
  message,
  children,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  singleButton = false,
  confirmVariant = 'primary',
  testID = 'alert-dialog',
  ...modalProps
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  const handleConfirm = () => {
    onConfirm?.();
    if (!onConfirm) {
      onClose();
    }
  };

  const handleCancel = () => {
    onCancel?.();
    if (!onCancel) {
      onClose();
    }
  };

  return (
    <CommonModal
      visible={visible}
      onClose={onClose}
      position="center"
      animationType="fade"
      testID={testID}
      {...modalProps}
    >
      <View style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary }
      ]}>
        {/* 제목 */}
        <Text style={[
          styles.title,
          { color: theme.colors.text.primary }
        ]}>
          {title}
        </Text>

        {/* 메시지 또는 커스텀 컨텐츠 */}
        {children ? (
          <View style={styles.content}>
            {children}
          </View>
        ) : message ? (
          <Text style={[
            styles.message,
            { color: theme.colors.text.secondary }
          ]}>
            {message}
          </Text>
        ) : null}

        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          {!singleButton && onCancel && (
            <Button
              title={cancelText}
              variant="outline"
              size="md"
              onPress={handleCancel}
              style={styles.button}
            />
          )}
          <Button
            title={confirmText}
            variant={confirmVariant}
            size="md"
            onPress={handleConfirm}
            style={singleButton ? styles.singleButton : styles.button}
          />
        </View>
      </View>
    </CommonModal>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    minWidth: 280,
  },
  title: {
    fontSize: 18,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  message: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  content: {
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
  },
  singleButton: {
    flex: 0,
    minWidth: 100,
    alignSelf: 'center',
  },
});

export default AlertDialog;