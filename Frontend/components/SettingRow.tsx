import { ThemedText } from '@/components/ThemedText'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

type Props = {
  title: string
  subtitle?: string
  right?: React.ReactNode
  onPress?: () => void
  leftIconName?: string
  leftIconColor?: string
  titleColor?: string
}

export function SettingRow({ title, subtitle, right, onPress, leftIconName, leftIconColor, titleColor }: Props) {
  const Content = (
    <View style={styles.row}>
      {leftIconName ? (
        <View style={[styles.iconWrap, { backgroundColor: '#f3f5f9' }]}>
          <Ionicons name={leftIconName as any} size={18} color={leftIconColor || '#666'} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <ThemedText style={{ fontWeight: '600', fontSize: 15, color: titleColor || '#222' }}>{title}</ThemedText>
        {subtitle ? <ThemedText style={{ fontSize: 13, color: '#666', marginTop: 6 }}>{subtitle}</ThemedText> : null}
      </View>
      {right ? right : onPress ? <Ionicons name="chevron-forward" size={18} color="#bbb" /> : null}
    </View>
  )

  if (onPress) return <TouchableOpacity onPress={onPress}>{Content}</TouchableOpacity>
  return Content
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
})
