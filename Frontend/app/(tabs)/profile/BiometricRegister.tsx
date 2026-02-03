import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { Toggle } from '@/components/Toggle'
import { setBiometric } from '@/src/api/settings'
import { AuthKeypad, CommonModal, PinDots } from '@/src/components'
import { useVerifyPin } from '@/src/hooks'
import { monitoringService } from '@/src/services/monitoringService'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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
  const [/* loading */, /* setLoading */] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // PIN 모달이 열릴 때마다 PIN 초기화
  React.useEffect(() => {
    if (pinModalVisible) {
      setPin('')
      setError(null)
    }
  }, [pinModalVisible])

  const closePinModal = useCallback(() => {
    setPinModalVisible(false)
    setShowPinEntry(false)
    setPin('')
    setError(null)
  }, [])

  const { verify, loading: verifyLoading, error: verifyError, setError: setVerifyError } = useVerifyPin()

  const handleVerify = useCallback(async (value: string) => {
    const result = await verify(value)
    if (!result.success) {
      Alert.alert('오류', verifyError || '인증에 실패했습니다.')
      setPin('')
      setVerifyError(null)
      return
    }

    if (result.valid) {
      monitoringService.logUserInteraction('navigation', { to: 'BiometricRegister.register' })
      // 서버에 생체 활성화 요청
      const ok = await setBiometric(true)
      if (!ok) {
        setError('생체 등록에 실패했습니다.')
        setPin('') // PIN 초기화
        monitoringService.logSettingChange('biometric', undefined, false)
        return
      }
      monitoringService.logSettingChange('biometric', true, true)
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
  }, [verify, verifyError, setVerifyError, onRegistered])

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
                  monitoringService.logSettingChange('biometric_toggle_attempt', v)
                  return
                }

                // 끄는 경우: 바로 비활성화 요청
                setShowPinEntry(false)
                monitoringService.logSettingChange('biometric_toggle', v)
                setBiometric(false).catch((err) => {
                  // 실패시 로그
                  monitoringService.logSettingChange('biometric', false, false, { errorMessage: (err as Error).message })
                })
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
      onClose={closePinModal}
    >
          <SafeAreaView style={styles.pinSafeArea}>
          <View style={styles.pinHeaderBar}>
          <View style={styles.pinHeaderSide} />
          <Text style={styles.pinHeaderTitle}>생체 인증 등록</Text>
          <Pressable hitSlop={10} onPress={closePinModal} style={styles.pinHeaderSide}>
            <Text style={styles.pinHeaderClose}>✕</Text>
          </Pressable>
        </View>
          <KeyboardAvoidingView style={styles.pinContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.pinContent}>
            <Text style={styles.pinTitle}>생체 인증 등록을 위해 PIN 6자리를 입력해주세요.</Text>
            <Text style={styles.pinSubtitle}></Text>
            <View style={styles.pinDotsWrap}>
              <PinDots length={6} filled={pin.length} size="md" />
            </View>
            {verifyLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#2383BD" />
                <Text style={styles.loadingText}>검증 중...</Text>
              </View>
            )}
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
          <View style={styles.pinKeypadWrap}>
            <AuthKeypad
              onDigitPress={(d: string) => {
                const next = pin + d
                if (next.length <= 6) setPin(next)
                if (next.length === 6) handleVerify(next)
              }}
              onBackspace={() => setPin(pin.slice(0, -1))}
              onClear={() => setPin('')}
              shuffle
              fakeTouch
              animation
              size="medium"
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
  // PIN modal styles to match signup screen
  pinSafeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  pinContainer: { flex: 1, justifyContent: 'center' },
  pinContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  pinTitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  pinSubtitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 48 },
  pinDotsWrap: { justifyContent: 'center', alignItems: 'center', marginBottom: 48 },
  pinKeypadWrap: { backgroundColor: '#F3F4F6', paddingVertical: 20, paddingHorizontal: 24 },
  // PIN modal header
  pinHeaderBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F3F4F6' },
  pinHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center', flex: 1 },
  pinHeaderClose: { fontSize: 18, color: '#111827', textAlign: 'right' },
  pinHeaderSide: { width: 24 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  loadingText: { marginLeft: 8, color: '#374151' },
  errorText: { marginTop: 8, color: '#DC2626' },
})
