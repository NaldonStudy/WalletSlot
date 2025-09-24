import { AuthPinEntry, CommonModal } from '@/src/components'
import { useChangePin } from '@/src/hooks'
import { monitoringService } from '@/src/services/monitoringService'
import React, { useMemo, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'

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

  const dots = useMemo(() => (count: number) => {
    const arr = []
    for (let i = 0; i < count; i++) arr.push(i)
    return arr
  }, [])

  const handleVerify = async (pinValue: string) => {
    if (!/^[0-9]{6}$/.test(pinValue)) { 
      Alert.alert('오류', 'PIN은 6자리 숫자여야 합니다.')
      setCurrentPin('') // PIN 초기화
      return 
    }
    try {
      const res = await fetch('/api/auth/pin/verify', { method: 'POST', body: JSON.stringify({ pin: pinValue }) })
      if (!res.ok) { 
        Alert.alert('오류', 'PIN이 일치하지 않습니다.')
        setCurrentPin('') // PIN 초기화
        return 
      }
      const json = await res.json()
      if (json?.valid) {
        monitoringService.logUserInteraction('navigation', { to: 'PinChangeNew' })
        setStep('new')
        setCurrentPin(pinValue)
      } else {
        Alert.alert('오류', '인증에 실패했습니다.')
        setCurrentPin('') // PIN 초기화
      }
    } catch (e) {
      Alert.alert('오류', '서버와 통신 중 오류가 발생했습니다.')
      setCurrentPin('') // PIN 초기화
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
      
      monitoringService.logUserInteraction('setting_change', { key: 'pin_change', success: true })
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
      {step === 'verify' && (
        <AuthPinEntry
          title="비밀번호 변경"
          subtitle="현재 비밀번호를 입력해주세요."
          length={6}
          value={currentPin}
          showBack={false}
          onClose={onClose}
          onDigitPress={(d: string) => {
            const next = currentPin + d
            if (next.length <= 6) setCurrentPin(next)
            if (next.length === 6) handleVerify(next)
          }}
          onDelete={() => setCurrentPin(currentPin.slice(0, -1))}
          onClear={() => setCurrentPin('')}
          onForgot={() => Alert.alert('비밀번호를 잊으셨나요?', '지원팀에 문의해주세요.')}
          keypadConfig={{
            fakeTouch: true,
            animation: true,
            size: 'medium'
          }}
        />
      )}

      {step === 'new' && (
        <AuthPinEntry
          title="새 비밀번호"
          subtitle="새 비밀번호를 입력하세요"
          length={6}
          value={newPin}
          showBack={false}
          onClose={onClose}
          onDigitPress={(d: string) => {
            const next = newPin + d
            if (next.length <= 6) setNewPin(next)
            if (next.length === 6) handleSetNew(next)
          }}
          onDelete={() => setNewPin(newPin.slice(0, -1))}
          onClear={() => setNewPin('')}
          onForgot={() => Alert.alert('비밀번호를 잊으셨나요?', '지원팀에 문의해주세요.')}
          keypadConfig={{
            fakeTouch: true,
            animation: true,
            size: 'medium'
          }}
        />
      )}

      {step === 'confirm' && (
        <AuthPinEntry
          title="비밀번호 확인"
          subtitle="새 비밀번호를 확인하세요"
          length={6}
          value={confirmPin}
          showBack={true}
          onBack={() => setStep('new')}
          onClose={onClose}
          onDigitPress={(d: string) => {
            const next = confirmPin + d
            if (next.length <= 6) setConfirmPin(next)
            if (next.length === 6) handleConfirm(next)
          }}
          onDelete={() => setConfirmPin(confirmPin.slice(0, -1))}
          onClear={() => setConfirmPin('')}
          onForgot={() => Alert.alert('비밀번호를 잊으셨나요?', '지원팀에 문의해주세요.')}
          keypadConfig={{
            fakeTouch: true,
            animation: true,
            size: 'medium'
          }}
        />
      )}
    </CommonModal>
  )
}

const styles = StyleSheet.create({
  // 스타일은 이제 AuthPinEntry 컴포넌트에서 처리됩니다
})
