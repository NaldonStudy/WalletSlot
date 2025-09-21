import { ThemedView } from '@/components/ThemedView'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

type Props = ViewProps & {
  children: React.ReactNode
}

export function SettingCard({ children, style, ...rest }: Props) {
  return (
    <ThemedView style={[styles.card, style]} {...rest}>
      <View>{children}</View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f5',
  },
})
