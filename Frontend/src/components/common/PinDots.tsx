import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

type Size = 'sm' | 'md' | 'lg' | number

export type PinDotsProps = {
  length?: number
  filled?: number
  size?: Size
  filledColor?: string
  emptyColor?: string
  gap?: number
  style?: ViewStyle
}

const sizeToPx = (s: Size) => {
  if (typeof s === 'number') return s
  switch (s) {
    case 'sm':
      return 10
    case 'lg':
      return 18
    case 'md':
    default:
      return 16
  }
}

export const PinDots: React.FC<PinDotsProps> = ({
  length = 6,
  filled = 0,
  size = 'md',
  filledColor = '#3B82F6',
  emptyColor = '#D1D5DB',
  gap = 12,
  style,
}) => {
  const px = sizeToPx(size)
  return (
    <View style={[styles.row, { gap }, style]}> 
      {Array.from({ length }).map((_, i) => {
        const isFilled = i < filled
        return (
          <View
            key={i}
            style={{
              width: px,
              height: px,
              borderRadius: px / 2,
              borderWidth: 2,
              borderColor: isFilled ? filledColor : emptyColor,
              backgroundColor: isFilled ? filledColor : 'transparent',
            }}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
})

export default PinDots
