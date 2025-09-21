import PinEntry from '@/components/PinEntry'
import { ThemedView } from '@/components/ThemedView'
import { monitoringService } from '@/src/services/monitoringService'
import React, { useMemo, useState } from 'react'
import { Alert, Modal, StyleSheet } from 'react-native'

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

  const dots = useMemo(() => (count: number) => {
    const arr = []
    for (let i = 0; i < count; i++) arr.push(i)
    return arr
  }, [])

  const handleVerify = async (pinValue: string) => {
    if (!/^[0-9]{6}$/.test(pinValue)) { Alert.alert('오류', 'PIN은 6자리 숫자여야 합니다.'); return }
    try {
      const res = await fetch('/api/auth/pin/verify', { method: 'POST', body: JSON.stringify({ pin: pinValue }) })
      if (!res.ok) { Alert.alert('오류', 'PIN이 일치하지 않습니다.'); return }
      const json = await res.json()
      if (json?.valid) {
        monitoringService.logUserInteraction('navigation', { to: 'PinChangeNew' })
        setStep('new')
        setCurrentPin(pinValue)
      } else {
        Alert.alert('오류', '인증에 실패했습니다.')
      }
    } catch (e) {
      Alert.alert('오류', '서버와 통신 중 오류가 발생했습니다.')
    }
  }

  const handleSetNew = (pinValue: string) => {
    if (!/^[0-9]{6}$/.test(pinValue)) { Alert.alert('오류', '새 PIN은 6자리 숫자여야 합니다.'); return }
    setNewPin(pinValue)
    setStep('confirm')
  }

  const handleConfirm = async (pinValue: string) => {
    if (pinValue !== newPin) { Alert.alert('오류', '새 PIN이 일치하지 않습니다.'); setConfirmPin(''); return }
    try {
      const res = await fetch('/api/auth/pin', { method: 'PATCH', body: JSON.stringify({ currentPin, newPin }) })
      if (!res.ok) { Alert.alert('오류', 'PIN 변경에 실패했습니다.'); return }
      monitoringService.logUserInteraction('setting_change', { key: 'pin_change', success: true })
      Alert.alert('성공', 'PIN이 변경되었습니다.')
      setNewPin('')
      setConfirmPin('')
      onClose()
      if (onSuccess) onSuccess()
    } catch (e) {
      Alert.alert('오류', '서버와 통신 중 오류가 발생했습니다.')
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <ThemedView style={styles.container}>
        {step === 'verify' && (
      <PinEntry
            title="비밀번호 변경"
            subtitle="현재 비밀번호를 입력해주세요."
        length={6}
            value={currentPin}
            showBack={false}
            onClose={onClose}
            onDigitPress={(d) => {
              const next = currentPin + d
              if (next.length <= 6) setCurrentPin(next)
              if (next.length === 6) handleVerify(next)
            }}
            onDelete={() => setCurrentPin(currentPin.slice(0, -1))}
            onForgot={() => Alert.alert('비밀번호를 잊으셨나요?', '지원팀에 문의해주세요.')}
          />
        )}

        {step === 'new' && (
          <PinEntry
            title="새 비밀번호"
            subtitle="새 비밀번호를 입력하세요"
            length={6}
            value={newPin}
            showBack={true}
            onBack={() => setStep('verify')}
            onClose={onClose}
            onDigitPress={(d) => {
              const next = newPin + d
              if (next.length <= 6) setNewPin(next)
              if (next.length === 6) handleSetNew(next)
            }}
            onDelete={() => setNewPin(newPin.slice(0, -1))}
            onForgot={() => Alert.alert('비밀번호를 잊으셨나요?', '지원팀에 문의해주세요.')}
          />
        )}

        {step === 'confirm' && (
          <PinEntry
            title="비밀번호 확인"
            subtitle="새 비밀번호를 확인하세요"
            length={6}
            value={confirmPin}
            showBack={true}
            onBack={() => setStep('new')}
            onClose={onClose}
            onDigitPress={(d) => {
              const next = confirmPin + d
              if (next.length <= 6) setConfirmPin(next)
              if (next.length === 6) handleConfirm(next)
            }}
            onDelete={() => setConfirmPin(confirmPin.slice(0, -1))}
            onForgot={() => Alert.alert('비밀번호를 잊으셨나요?', '지원팀에 문의해주세요.')}
          />
        )}
      </ThemedView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  headerLeft: { position: 'absolute', left: 18 },
  headerRight: { position: 'absolute', right: 18, width: 24 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { flex: 1, padding: 18, justifyContent: 'space-between' },
  dot: { width: 12, height: 12, borderRadius: 6, margin: 8 },
  dotFilled: { backgroundColor: '#333' },
  dotEmpty: { backgroundColor: '#ddd' },
})
