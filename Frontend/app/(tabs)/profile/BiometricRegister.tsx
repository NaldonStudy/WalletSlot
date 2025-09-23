import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { Toggle } from '@/components/Toggle'
import { AuthPinEntry, CommonModal } from '@/src/components'
import { monitoringService } from '@/src/services/monitoringService'
import React, { useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

type Props = {
  visible: boolean
  onClose: () => void
  onRegistered?: () => void
  initialEnabled?: boolean
}

export default function BiometricRegister({ visible, onClose, onRegistered, initialEnabled }: Props) {
  const [pin, setPin] = useState('')
  const [showPinEntry, setShowPinEntry] = useState(!!initialEnabled)
  const [pinModalVisible, setPinModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // PIN 모달이 열릴 때마다 PIN 초기화
  React.useEffect(() => {
    if (pinModalVisible) {
      setPin('')
      setError(null)
    }
  }, [pinModalVisible])

  const handleVerify = async (value: string) => {
    if (!/^[0-9]{6}$/.test(value)) { 
      Alert.alert('오류', 'PIN은 6자리 숫자여야 합니다.')
      setPin('') // PIN 초기화
      return 
    }
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/auth/pin/verify', { method: 'POST', body: JSON.stringify({ pin: value }) })
      setLoading(false)
      if (!res.ok) { 
        Alert.alert('오류', 'PIN이 일치하지 않습니다.')
        setPin('') // PIN 초기화
        return 
      }
      const json = await res.json()
      if (json?.valid) {
        monitoringService.logUserInteraction('navigation', { to: 'BiometricRegister.register' })
        // 모의: 서버에 생체 활성화 요청
        const r2 = await fetch('/api/users/me/settings/biometric', { method: 'PATCH', body: JSON.stringify({ enabled: true }) })
        if (!r2.ok) { 
          setError('생체 등록에 실패했습니다.')
          setPin('') // PIN 초기화
          monitoringService.logUserInteraction('setting_change', { key: 'biometric', success: false })
          return 
        }
        monitoringService.logUserInteraction('setting_change', { key: 'biometric', enabled: true, success: true })
        Alert.alert('완료', '생체 인증이 등록되었습니다.')
        // PIN 검증이 성공하면 토글을 켜고 PIN 모달을 닫음
        setShowPinEntry(true)
        setPin('')
        setPinModalVisible(false)
        if (onRegistered) onRegistered()
      } else {
        Alert.alert('오류', '인증에 실패했습니다.')
        setPin('') // PIN 초기화
      }
    } catch (e) {
      setLoading(false)
      setError('서버와 통신 중 오류가 발생했습니다.')
      setPin('') // PIN 초기화
      monitoringService.logApiCall('/api/auth/pin/verify', 'POST', 'error', { errorMessage: (e as Error).message })
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
    <CommonModal visible={visible} animationType="slide" position="fullscreen" onClose={onClose}>
      <ThemedView style={styles.container}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>{'생체 인증'}</ThemedText>
          <Pressable onPress={onClose}><ThemedText style={{ color: '#667eea' }}>{'취소'}</ThemedText></Pressable>
        </View>

        <View style={styles.content}>
          <View style={styles.rowSpace}>
            <View style={styles.toggleRow}>
              <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>{'생체 인증'}</ThemedText>
              <Toggle value={showPinEntry} onValueChange={(v) => {
                if (v) {
                  // 켜려는 시도: 별도 PIN 모달을 열어 확인
                  setPinModalVisible(true)
                  monitoringService.logUserInteraction('setting_change', { key: 'biometric_toggle_attempt', enabled: v })
                } else {
                  // 끄는 경우: 바로 비활성화 요청
                  setShowPinEntry(false)
                  monitoringService.logUserInteraction('setting_change', { key: 'biometric_toggle', enabled: v })
                  fetch('/api/users/me/settings/biometric', { method: 'PATCH', body: JSON.stringify({ enabled: false }) })
                }
              }} />
            </View>

            <View style={styles.infoBox}>
              <ThemedText>{'• 생체 인증이 가능한 단말기에 생체 정보가 등록되어 있어야 사용할 수 있어요.'}</ThemedText>
              <ThemedText>{'• 비밀번호 6자리 대신 사용할 수 있어요.'}</ThemedText>
            </View>
          </View>

          {/* PIN 입력은 별도 모달로 처리 */}
        </View>
      </ThemedView>
    </CommonModal>

    <CommonModal 
      visible={pinModalVisible} 
      animationType="slide" 
      position="fullscreen" 
      onClose={() => { setPinModalVisible(false); setShowPinEntry(false); setPin('') }}
    >
      <AuthPinEntry
        title="생체 인증 등록"
        subtitle="생체 인증을 등록하려면 PIN으로 본인 확인을 해주세요."
        length={6}
        value={pin}
        showBack={true}
        onBack={() => { setPinModalVisible(false); setShowPinEntry(false); setPin('') }}
        onClose={() => { setPinModalVisible(false); setShowPinEntry(false); setPin('') }}
        onDigitPress={(d: string) => {
          const next = pin + d
          if (next.length <= 6) setPin(next)
          if (next.length === 6) handleVerify(next)
        }}
        onDelete={() => setPin(pin.slice(0, -1))}
        onClear={() => setPin('')}
        keypadConfig={{
          fakeTouch: true,
          animation: true,
          size: 'medium'
        }}
      />
    </CommonModal>

    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 20, fontWeight: '700' },
  content: { flex: 1, padding: 18 },
  rowSpace: { marginBottom: 12 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoBox: { marginTop: 12, padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 6, backgroundColor: '#fafafa' },
})
