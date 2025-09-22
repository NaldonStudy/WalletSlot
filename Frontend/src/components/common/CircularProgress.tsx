import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Image } from 'expo-image';
import { ImageSourcePropType } from 'react-native';

type CircularProgressProps = {
  progress: number; // 0-1 사이의 값
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  icon?: ImageSourcePropType; // require()로 가져온 아이콘
  iconSize?: number;
};

const CircularProgress = ({
  progress,
  size = 80,
  strokeWidth = 6,
  color = '#F1A791',
  backgroundColor = '#E5E5E5',
  icon,
  iconSize = 24,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* 배경 원 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* 진행률 원 */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {/* 중앙 아이콘 */}
      {icon && (
        <View style={styles.iconContainer}>
          <Image 
            source={icon} 
            style={[styles.icon, { width: iconSize, height: iconSize }]}
            contentFit="contain"
            transition={200}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    // 원본 아이콘 색상 유지
  },
});

export default CircularProgress;
