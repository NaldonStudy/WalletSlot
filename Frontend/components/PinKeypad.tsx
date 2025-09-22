import { Ionicons } from '@expo/vector-icons'
import React, { useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type Props = {
  length?: number
  onDigitPress: (digit: string) => void
  onDelete?: () => void
}

// 숫자 버튼을 무작위로 배치하는 키패드 컴포넌트
export default function PinKeypad({ length = 4, onDigitPress, onDelete }: Props) {
  const [digits, setDigits] = useState<string[]>(() => {
    const arr = ['0','1','2','3','4','5','6','7','8','9']
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  })

  const shuffle = useCallback(() => {
    setDigits((prev) => {
      const arr = [...prev]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    })
  }, [])

  // Build a 3x4 grid: first 9 digits, then bottom row [shuffle, lastDigit, delete]
  const gridItems = useMemo(() => {
    const items: Array<{ type: 'digit'|'action', value?: string, action?: 'shuffle'|'delete' }> = []
    const firstNine = digits.slice(0, 9)
    firstNine.forEach(d => items.push({ type: 'digit', value: d }))
    const lastDigit = digits[9]
    items.push({ type: 'action', action: 'shuffle' })
    items.push({ type: 'digit', value: lastDigit })
    items.push({ type: 'action', action: 'delete' })
    return items
  }, [digits])

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {gridItems.map((it, idx) => {
          if (it.type === 'digit') {
            return (
              <TouchableOpacity key={`d-${idx}-${it.value}`} onPress={() => onDigitPress(it.value!)} style={styles.key} accessibilityLabel={`digit_${it.value}`}>
                <Text style={styles.keyText}>{it.value}</Text>
              </TouchableOpacity>
            )
          }
          if (it.action === 'shuffle') {
            return (
              <TouchableOpacity key={`a-shuffle-${idx}`} onPress={shuffle} style={styles.key} accessibilityLabel="shuffle">
                <Ionicons name="shuffle" size={22} color="#222" />
              </TouchableOpacity>
            )
          }
          return (
            <TouchableOpacity key={`a-delete-${idx}`} onPress={() => onDelete && onDelete()} style={styles.key} accessibilityLabel="delete">
              <Ionicons name="backspace" size={22} color="#222" />
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  grid: {
    width: '100%',
    maxWidth: 280,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  key: {
    width: 80,
    height: 80,
    marginVertical: 6,
    marginHorizontal: 4,
    backgroundColor: '#f7f7fb',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600'
  }
})
