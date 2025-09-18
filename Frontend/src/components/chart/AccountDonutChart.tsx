import { themes } from '@/src/constants/theme';
import { SlotData } from '@/src/types';
import React, { memo } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

type AccountDonutChartProps = {
    data: SlotData[];
};

const AccountDonutChart = memo(({ data }: AccountDonutChartProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];
    
    const totalBudget = data.reduce((sum, slot) => sum + slot.budget, 0);
    const size = 180;
    const innerRadius = 60;
    const outerRadius = 80;
    const centerX = size / 2;
    const centerY = size / 2;

     // 각 슬롯의 각도 계산 (간격 포함)
     const gapAngle = 2; // 각 슬롯 사이 간격 (도)
     const totalGapAngle = gapAngle * data.length; // 전체 간격
     const availableAngle = 360 - totalGapAngle; // 사용 가능한 각도
     
     let currentAngle = -90; // -90도부터 시작 (12시 방향)
     const slots = data.map((slot, index) => {
         const budgetRatio = slot.budget / totalBudget;
         const angle = budgetRatio * availableAngle; // 간격을 제외한 각도
         const remainRatio = slot.remain / slot.budget;

         const slotData = {
             ...slot,
             startAngle: currentAngle,
             endAngle: currentAngle + angle,
             budgetRatio,
             remainRatio,
         };

         currentAngle += angle + gapAngle; // 각도 + 간격
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
                     const usedAngle = (slot.endAngle - slot.startAngle) - remainAngle; // 사용된 각도
                     const usedEndAngle = slot.startAngle + usedAngle; // 사용된 부분 끝 각도

                     return (
                          <G key={slot.slotId}>
                              {/* 사용된 부분 (연한 색) - 먼저 그리기 (시계 방향으로 먼저) */}
                              <Path
                                  d={createArcPath(slot.startAngle, usedEndAngle, innerRadius, outerRadius)}
                                  fill={theme.colors.background.secondary} // 30은 투명도 (연한 색)
                                  stroke="none" // 슬롯 내부는 경계선 없음
                              />
                              {/* 남은 부분 (진한 색) - 나중에 그리기 (사용된 부분 뒤에) */}
                              <Path
                                  d={createArcPath(usedEndAngle, slot.endAngle, innerRadius, outerRadius)}
                                  fill={slot.color} // 진한 색
                                  stroke="none" // 슬롯 내부는 경계선 없음
                              />
                              
                              {/* 슬롯 경계선 (시작과 끝) */}
                              <Path
                                  d={`M ${polarToCartesian(centerX, centerY, innerRadius, slot.startAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, slot.startAngle).y} L ${polarToCartesian(centerX, centerY, outerRadius, slot.startAngle).x} ${polarToCartesian(centerX, centerY, outerRadius, slot.startAngle).y}`}
                                  fill="none"
                                  stroke={theme.colors.background.tertiary}
                                  strokeWidth="4"
                                  strokeLinecap="round"
                              />
                              <Path
                                  d={`M ${polarToCartesian(centerX, centerY, innerRadius, slot.endAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, slot.endAngle).y} L ${polarToCartesian(centerX, centerY, outerRadius, slot.endAngle).x} ${polarToCartesian(centerX, centerY, outerRadius, slot.endAngle).y}`}
                                  fill="none"
                                  stroke={theme.colors.background.tertiary}
                                  strokeWidth="4"
                                  strokeLinecap="round"
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
                        fill={theme.colors.text.primary}
                    >
                        총 예산
                    </SvgText>
                    <SvgText
                        x={centerX}
                        y={centerY + 15}
                        fontSize="16"
                        fontWeight="bold"
                        textAnchor="middle"
                        fill={theme.colors.text.primary}
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
                            <Text style={[styles.legendText, { color: theme.colors.text.primary }]}>
                                {slot.name} {remainPercentage}%
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}, (prevProps, nextProps) => {
    // 슬롯 데이터가 같으면 리렌더링하지 않음
    if (prevProps.data.length !== nextProps.data.length) return false;
    
    return prevProps.data.every((slot, index) => {
        const nextSlot = nextProps.data[index];
        return slot.slotId === nextSlot.slotId &&
               slot.name === nextSlot.name &&
               slot.budget === nextSlot.budget &&
               slot.remain === nextSlot.remain &&
               slot.color === nextSlot.color;
    });
});

AccountDonutChart.displayName = 'AccountDonutChart';

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
        // color는 동적으로 적용됨
    },
});
