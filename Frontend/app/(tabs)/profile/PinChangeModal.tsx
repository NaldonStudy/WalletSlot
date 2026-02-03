import { AuthKeypad, CommonModal, PinDots } from '@/src/components'
import { useChangePin, useVerifyPin } from '@/src/hooks'
import { monitoringService } from '@/src/services/monitoringService'
import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Props = {
  visible: boolean
  onClose: () => void
  // PIN 변경 성공 시 호출되는 콜백
  onSuccess?: () => void
}

export default function PinChangeModal({ visible, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'verify' | 'new' | 'confirm'>('verify')
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  
  const changePinMutation = useChangePin()

  // 모달이 열릴 때마다 상태 초기화
  React.useEffect(() => {
    if (visible) {
      setStep('verify')
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
    }
  }, [visible])

  // dots helper removed (unused)

  const { verify, error: verifyError, setError: setVerifyError } = useVerifyPin()

  const handleVerify = async (pinValue: string) => {
    const result = await verify(pinValue)
    if (!result.success) {
      Alert.alert('오류', verifyError || '인증에 실패했습니다.')
      setCurrentPin('')
      setVerifyError(null)
      return
    }
    if (result.valid) {
      monitoringService.logUserInteraction('navigation', { to: 'PinChangeNew' })
      setStep('new')
      setCurrentPin(pinValue)
    } else {
      Alert.alert('오류', '인증에 실패했습니다.')
      setCurrentPin('')
    }
  }

  const handleSetNew = (pinValue: string) => {
    if (!/^[0-9]{6}$/.test(pinValue)) { 
      Alert.alert('오류', '새 PIN은 6자리 숫자여야 합니다.')
      setNewPin('') // PIN 초기화
      return 
    }
    setNewPin(pinValue)
    setStep('confirm')
  }

  const handleConfirm = async (pinValue: string) => {
    if (pinValue !== newPin) { 
      Alert.alert('오류', '새 PIN이 일치하지 않습니다.')
      setConfirmPin('') // PIN 초기화
      return 
    }
    try {
      await changePinMutation.mutateAsync({
        currentPin,
        newPin
      })
      
  monitoringService.logSettingChange('pin_change', undefined, true)
      setNewPin('')
      setConfirmPin('')
      onClose()
      if (onSuccess) onSuccess()
    } catch (e) {
      Alert.alert('오류', 'PIN 변경에 실패했습니다.')
      setConfirmPin('') // PIN 초기화
    }
  }

  return (
    <CommonModal 
      visible={visible} 
      animationType="slide" 
      position="fullscreen" 
      onClose={onClose}
      closeOnOverlayPress={false}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBar}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle}>비밀번호 변경</Text>
          <Pressable hitSlop={10} onPress={onClose} style={styles.headerSide}>
            <Text style={styles.headerClose}>✕</Text>
          </Pressable>
        </View>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {step === 'verify' && (
            <PinStep
              title="현재 PIN 6자리를 입력해주세요."
              subtitle=""
              value={currentPin}
              onDigit={(d) => {
                const next = currentPin + d
                if (next.length <= 6) setCurrentPin(next)
                if (next.length === 6) handleVerify(next)
              }}
              onBackspace={() => setCurrentPin(currentPin.slice(0, -1))}
              onClear={() => setCurrentPin('')}
              onForgot={() => Alert.alert('비밀번호를 잊으셨나요?', '지원팀에 문의해주세요.')}
            />
          )}

          {step === 'new' && (
            <PinStep
              title="새 PIN 6자리를 입력해주세요."
              subtitle=""
              value={newPin}
              onDigit={(d) => {
                const next = newPin + d
                if (next.length <= 6) setNewPin(next)
                if (next.length === 6) handleSetNew(next)
              }}
              onBackspace={() => setNewPin(newPin.slice(0, -1))}
              onClear={() => setNewPin('')}
              onForgot={() => Alert.alert('비밀번호를 잊으셨나요?', '지원팀에 문의해주세요.')}
            />
          )}

          {step === 'confirm' && (
            <PinStep
              title="확인을 위해 한 번 더 입력해주세요."
              subtitle=""
              value={confirmPin}
              onDigit={(d) => {
                const next = confirmPin + d
                if (next.length <= 6) setConfirmPin(next)
                if (next.length === 6) handleConfirm(next)
              }}
              onBack={() => setStep('new')}
              onBackspace={() => setConfirmPin(confirmPin.slice(0, -1))}
              onClear={() => setConfirmPin('')}
              onForgot={() => Alert.alert('비밀번호를 잊으셨나요?', '지원팀에 문의해주세요.')}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </CommonModal>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F3F4F6' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center', flex: 1 },
  headerClose: { fontSize: 18, color: '#111827', textAlign: 'right' },
  headerSide: { width: 24 },
  container: { flex: 1, justifyContent: 'center' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 48 },
  pinContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 48 },
  keypadContainer: { backgroundColor: '#F3F4F6', paddingVertical: 20, paddingHorizontal: 24 },
})

type PinStepProps = {
  title: string
  subtitle: string
  value: string
  onDigit: (d: string) => void
  onBackspace: () => void
  onClear: () => void
  onForgot?: () => void
  onBack?: () => void
}

function PinStep({ title, subtitle, value, onDigit, onBackspace, onClear, onForgot, onBack }: PinStepProps) {
  return (
    <>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.pinContainer}>
          <PinDots length={6} filled={value.length} size="md" />
        </View>
      </View>
      <View style={styles.keypadContainer}>
        <AuthKeypad
          onDigitPress={onDigit}
          onBackspace={onBackspace}
          onClear={onClear}
          shuffle
          fakeTouch
          animation
          size="medium"
        />
        {onForgot && (
          <Text onPress={onForgot} style={{ color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
            비밀번호를 잊으셨나요?
          </Text>
        )}
        {onBack && (
          <Text onPress={onBack} style={{ color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
            뒤로가기
          </Text>
        )}
      </View>
    </>
  )
}
