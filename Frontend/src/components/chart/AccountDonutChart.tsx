import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle, G, Text as SvgText, Path } from "react-native-svg";
import { SlotData } from '@/src/types';

type AccountDonutChartProps = {
  data: SlotData[];
};

const AccountDonutChart = ({ data }: AccountDonutChartProps) => {
  const totalBudget = data.reduce((sum, slot) => sum + slot.budget, 0);
  const size = 250;
  const innerRadius = 80;
  const outerRadius = 120;
  const centerX = size / 2;
  const centerY = size / 2;

  // 각 슬롯의 각도 계산
  let currentAngle = -90; // -90도부터 시작 (12시 방향)
  const slots = data.map((slot) => {
    const budgetRatio = slot.budget / totalBudget;
    const angle = budgetRatio * 360;
    const remainRatio = slot.remain / slot.budget;
    
    const slotData = {
      ...slot,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      budgetRatio,
      remainRatio,
    };
    
    currentAngle += angle;
    return slotData;
  });

  // SVG Path 생성 함수 (도넛 형태)
  const createArcPath = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const startInner = polarToCartesian(centerX, centerY, innerR, startAngle);
    const endInner = polarToCartesian(centerX, centerY, innerR, endAngle);
    const startOuter = polarToCartesian(centerX, centerY, outerR, startAngle);
    const endOuter = polarToCartesian(centerX, centerY, outerR, endAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", startInner.x, startInner.y,
      "L", startOuter.x, startOuter.y,
      "A", outerR, outerR, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
      "L", endInner.x, endInner.y,
      "A", innerR, innerR, 0, largeArcFlag, 0, startInner.x, startInner.y,
      "Z"
    ].join(" ");
  };

  // 극좌표를 직교좌표로 변환
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        
        {/* 각 슬롯별 섹션 */}
        {slots.map((slot, index) => {
          const remainAngle = slot.remainRatio * (slot.endAngle - slot.startAngle);
          const remainEndAngle = slot.startAngle + remainAngle;
          
          return (
            <G key={slot.slotId}>
              {/* 사용된 부분 (연한 색) - 먼저 그리기 */}
              <Path
                d={createArcPath(slot.startAngle, slot.endAngle, innerRadius, outerRadius)}
                fill={`${slot.color}30`} // 30은 투명도 (연한 색)
                stroke="none"
              />
              
              {/* 남은 부분 (진한 색) - 나중에 그리기 (위에 덮어씀) */}
              <Path
                d={createArcPath(slot.startAngle, remainEndAngle, innerRadius, outerRadius)}
                fill={slot.color}
                stroke="none"
              />
            </G>
          );
        })}
        
        {/* 중앙 텍스트 */}
        <G>
          <SvgText
            x={centerX}
            y={centerY - 5}
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            fill="#666"
          >
            총 예산
          </SvgText>
          <SvgText
            x={centerX}
            y={centerY + 15}
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
            fill="#333"
          >
            {totalBudget.toLocaleString()}
          </SvgText>
        </G>
      </Svg>
      
      {/* 범례 */}
      <View style={styles.legend}>
        {data.map((slot) => {
          const remainPercentage = (slot.remain / slot.budget * 100).toFixed(0);
          return (
            <View key={slot.slotId} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: slot.color }]} />
              <Text style={styles.legendText}>
                {slot.name} {remainPercentage}%
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default AccountDonutChart;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  legend: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 2,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
});
