import { ThemedText } from '@/components/ThemedText'
import React from 'react'
import { Switch, View } from 'react-native'

type Props = {
  pushEnabled: boolean
  marketingEnabled: boolean
  onTogglePush: (v: boolean) => void
  onToggleMarketing: (v: boolean) => void
}

export function NotificationSettings({ pushEnabled, marketingEnabled, onTogglePush, onToggleMarketing }: Props) {
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
        <ThemedText>{'푸시 알림'}</ThemedText>
        <Switch value={pushEnabled} onValueChange={onTogglePush} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}>
        <ThemedText>{'마케팅 수신'}</ThemedText>
        <Switch value={marketingEnabled} onValueChange={onToggleMarketing} />
      </View>
    </View>
  )
}
