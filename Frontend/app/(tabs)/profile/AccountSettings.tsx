import { ThemedText } from '@/components/ThemedText'
import React from 'react'
import { Pressable, Switch, View } from 'react-native'

type Props = {
  biometricEnabled: boolean
  onToggleBiometric: (v: boolean) => void
  onChangePin: () => void
}

export function AccountSettings({ biometricEnabled, onToggleBiometric, onChangePin }: Props) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
        <ThemedText>{'생체 인증 사용'}</ThemedText>
        <Switch value={biometricEnabled} onValueChange={onToggleBiometric} />
      </View>

      <Pressable onPress={onChangePin} style={{ paddingVertical: 12 }}>
        <ThemedText>{'PIN 변경'}</ThemedText>
      </Pressable>
    </View>
  )
}
