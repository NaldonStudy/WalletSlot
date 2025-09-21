import PinKeypad from '@/components/PinKeypad'
import { ThemedText } from '@/components/ThemedText'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

type Props = {
  title?: string
  subtitle?: string
  length?: number
  value?: string
  visible?: boolean
  showBack?: boolean
  onBack?: () => void
  onClose?: () => void
  onDigitPress: (d: string) => void
  onDelete?: () => void
  onForgot?: () => void
}

// 재사용 가능한 PIN 입력 화면 컴포넌트
export default function PinEntry({ title = '비밀번호 변경', subtitle, length = 6, value = '', showBack = false, onBack, onClose, onDigitPress, onDelete, onForgot }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {showBack ? (
          <Pressable onPress={onBack} style={styles.headerLeft} accessibilityLabel="뒤로">
            <Ionicons name="chevron-back" size={24} color="#333" />
          </Pressable>
        ) : <View style={styles.headerLeft} />}

        <ThemedText style={styles.title}>{title}</ThemedText>

        <Pressable onPress={onClose} style={styles.headerRight} accessibilityLabel="닫기">
          <Ionicons name="close" size={22} color="#666" />
        </Pressable>
      </View>

      <View style={styles.bodyTop}>
        {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}

        <View style={{ height: 28 }} />

        <View style={styles.dotsRow}>
          {Array.from({ length }).map((_, i) => (
            <View key={i} style={[styles.dot, i < (value || '').length ? styles.dotFilled : styles.dotEmpty]} />
          ))}
        </View>
      </View>

      <View style={styles.bodyBottom} pointerEvents="box-none">
          <View style={styles.keypadWrap}>
            <PinKeypad onDigitPress={onDigitPress} onDelete={onDelete} />
          </View>

          <Pressable onPress={onForgot} style={styles.forgotWrap} accessibilityLabel="forgot">
            <ThemedText style={styles.forgotText}>비밀번호를 잊어버리셨나요?</ThemedText>
          </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  headerLeft: { position: 'absolute', left: 16, width: 36, alignItems: 'flex-start' },
  headerRight: { position: 'absolute', right: 16, width: 36, alignItems: 'flex-end' },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  bodyTop: { flex: 1, paddingHorizontal: 20, paddingTop: 60, alignItems: 'center', justifyContent: 'flex-start' },
  bodyBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingBottom: 50, paddingHorizontal: 20 },
  keypadWrap: { width: '100%', maxWidth: 320, alignItems: 'center' },
  subtitle: { fontSize: 16, color: '#222', fontWeight: '600' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 40, marginBottom: 40 },
  dot: { width: 12, height: 12, borderRadius: 6, margin: 6 },
  dotFilled: { backgroundColor: '#333' },
  dotEmpty: { backgroundColor: '#ddd' },
  forgotWrap: { marginTop: 12 },
  forgotText: { color: '#666' },
})
