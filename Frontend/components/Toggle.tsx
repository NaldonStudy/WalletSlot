import React from 'react'
import { Switch } from 'react-native'

type Props = {
  value: boolean
  onValueChange: (v: boolean) => void
  accessibilityLabel?: string
}

export function Toggle({ value, onValueChange, accessibilityLabel }: Props) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: '#e6e6e6', true: '#c7e1ff' }}
      thumbColor={value ? '#2b6be6' : '#fff'}
    />
  )
}
