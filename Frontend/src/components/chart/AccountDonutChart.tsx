import { SLOT_CATEGORIES, UNCATEGORIZED_SLOT_ID } from '@/src/constants/slots';
import { themes } from '@/src/constants/theme';
import { SlotData } from '@/src/types';
import React, { memo } from "react";
import { StyleSheet, Text, useColorScheme, View, TouchableOpacity } from "react-native";
import Svg, { G, Path, Text as SvgText, Circle } from "react-native-svg";

type AccountDonutChartProps = {
    data: SlotData[];
    onSlotPress?: (slot: SlotData) => void;
};

const AccountDonutChart = memo(({ data, onSlotPress }: AccountDonutChartProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = themes[colorScheme];
    
    // 미분류 슬롯 제외
    const filteredData = data.filter(slot => slot.slotId !== UNCATEGORIZED_SLOT_ID);
    const totalBudget = filteredData.reduce((sum, slot) => sum + slot.currentBudget, 0);
    
    const size = 180;
    const innerRadius = 60;
    const outerRadius = 80;
    const centerX = size / 2;
    const centerY = size / 2;

    // 슬롯 데이터가 없으면 빈 차트 표시
    if (filteredData.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                    슬롯 데이터가 없습니다
                </Text>
            </View>
        );
    }

     // 각 슬롯의 각도 계산 (간격 포함)
     const gapAngle = filteredData.length > 1 ? 2 : 0; // 슬롯이 2개 이상일 때만 간격 적용
     const totalGapAngle = gapAngle * filteredData.length; // 전체 간격
     const availableAngle = 360 - totalGapAngle; // 사용 가능한 각도
     
     let currentAngle = -90; // -90도부터 시작 (12시 방향)
    const slots = filteredData.map((slot, index) => {
        const remainRatio = slot.currentBudget > 0 ? slot.remainingBudget / slot.currentBudget : 0;
        const isOverBudget = slot.remainingBudget < 0;
        const slotColor = SLOT_CATEGORIES[slot.slotId as keyof typeof SLOT_CATEGORIES]?.color || '#F1A791';
        
        // 슬롯이 하나일 때는 항상 360도 원으로 만들기
        if (filteredData.length === 1) {
            return {
                ...slot,
                startAngle: -90,
                endAngle: 270, // -90 + 360 = 270
                budgetRatio: 1,
                remainRatio,
                isOverBudget,
                displayColor: isOverBudget ? '#FF4444' : slotColor,
            };
        }
         
         // 슬롯이 여러 개일 때는 예산 비율에 따라 계산
         const budgetRatio = totalBudget > 0 ? slot.currentBudget / totalBudget : 1 / filteredData.length;
         const angle = budgetRatio * availableAngle;
         
         const slotData = {
             ...slot,
             startAngle: currentAngle,
             endAngle: currentAngle + angle,
             budgetRatio,
             remainRatio,
             isOverBudget,
             displayColor: isOverBudget ? '#FF4444' : slotColor,
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
            <View style={styles.chartContainer}>
                <Svg width={size} height={size}>
                {/* 그림자 효과 - 중복 Path 방식 (React Native SVG 호환) */}

                 {/* 각 슬롯별 섹션 */}
                 {slots.map((slot, index) => {
                     const totalAngle = slot.endAngle - slot.startAngle;
                     const remainAngle = slot.remainRatio * totalAngle;
                     const usedAngle = totalAngle - remainAngle; // 사용된 각도
                     const usedEndAngle = slot.startAngle + usedAngle; // 사용된 부분 끝 각도
                     
                     

                     return (
                          <G key={slot.slotId}>
                              {/* 슬롯이 하나이고 잔액이 100%일 때만 단순한 원형 */}
                              {filteredData.length === 1 && slot.remainRatio === 1 ? (
                                  <>
                                      {/* 그림자 */}
                                      <Circle
                                          cx={centerX}
                                          cy={centerY}
                                          r={outerRadius + 1}
                                          fill="#000000"
                                          fillOpacity="0.2"
                                      />
                                      {/* 메인 원 */}
                                      <Circle
                                          cx={centerX}
                                          cy={centerY}
                                          r={outerRadius}
                                          fill={slot.displayColor}
                                      />
                                      {/* 내부 원 */}
                                      <Circle
                                          cx={centerX}
                                          cy={centerY}
                                          r={innerRadius}
                                          fill={colorScheme === 'dark' ? theme.colors.primary[800] : theme.colors.primary[50]}
                                      />
                                  </>
                              ) : (
                                  <>
                                      {slot.isOverBudget ? (
                                          // 예산 초과 시: 사용된 부분만 흰색으로 표시 (남은 부분은 비워둠)
                                          <>
                                              {/* 사용된 부분 그림자 */}
                                              <Path
                                                  d={createArcPath(slot.startAngle, slot.endAngle, innerRadius + 1, outerRadius + 1)}
                                                  fill="#000000"
                                                  fillOpacity="0.2"
                                                  stroke="none"
                                              />
                                              {/* 사용된 부분 (흰색) */}
                                              <Path
                                                  d={createArcPath(slot.startAngle, slot.endAngle, innerRadius, outerRadius)}
                                                  fill={theme.colors.background.primary}
                                                  stroke="none"
                                              />
                                          </>
                                      ) : (
                                          <>
                                              {/* 사용된 부분 그림자 */}
                                              {usedAngle > 0 && (
                                                  <Path
                                                      d={createArcPath(slot.startAngle, usedEndAngle, innerRadius + 1, outerRadius + 1)}
                                                      fill="#000000"
                                                      fillOpacity="0.2"
                                                      stroke="none"
                                                  />
                                              )}
                                              {/* 남은 부분 그림자 */}
                                              {remainAngle > 0 && usedAngle > 0 && (
                                                  <Path
                                                      d={createArcPath(usedEndAngle, slot.endAngle, innerRadius + 1, outerRadius + 1)}
                                                      fill="#000000"
                                                      fillOpacity="0.2"
                                                      stroke="none"
                                                  />
                                              )}
                                              {/* 사용된 부분 (연한 색) - 먼저 그리기 (시계 방향으로 먼저) */}
                                              {usedAngle > 0 && (
                                                  <Path
                                                      d={createArcPath(slot.startAngle, usedEndAngle, innerRadius, outerRadius)}
                                                      fill={theme.colors.background.secondary} // 30은 투명도 (연한 색)
                                                      stroke="none" // 슬롯 내부는 경계선 없음
                                                  />
                                              )}
                                              {/* 남은 부분 (진한 색) - 나중에 그리기 (사용된 부분 뒤에) */}
                                              {remainAngle > 0 && usedAngle > 0 && (
                                                  <Path
                                                      d={createArcPath(usedEndAngle, slot.endAngle, innerRadius, outerRadius)}
                                                      fill={slot.displayColor} // 진한 색
                                                      stroke="none" // 슬롯 내부는 경계선 없음
                                                  />
                                              )}
                                              {/* 예산을 모두 사용했을 때는 전체를 연한 색으로 표시 */}
                                              {usedAngle === totalAngle && (
                                                  <Path
                                                      d={createArcPath(slot.startAngle, slot.endAngle, innerRadius, outerRadius)}
                                                      fill={theme.colors.background.secondary}
                                                      stroke="none"
                                                  />
                                              )}
                                              {/* 예산을 전혀 사용하지 않았을 때는 전체를 진한 색으로 표시 */}
                                              {usedAngle === 0 && remainAngle === totalAngle && (
                                                  <Path
                                                      d={createArcPath(slot.startAngle, slot.endAngle, innerRadius, outerRadius)}
                                                      fill={slot.displayColor}
                                                      stroke="none"
                                                  />
                                              )}
                                          </>
                                      )}
                                  </>
                              )}
                              
                              {/* 슬롯 경계선 (시작과 끝) - 슬롯이 2개 이상일 때만 */}
                              {filteredData.length > 1 && (
                                  <>
                                      <Path
                                          d={`M ${polarToCartesian(centerX, centerY, innerRadius, slot.startAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, slot.startAngle).y} L ${polarToCartesian(centerX, centerY, outerRadius, slot.startAngle).x} ${polarToCartesian(centerX, centerY, outerRadius, slot.startAngle).y}`}
                                          fill="none"
                                          stroke={colorScheme === 'dark' ? theme.colors.primary[800] : theme.colors.primary[50]}
                                          strokeWidth="5"
                                          strokeLinecap="round"
                                      />
                                      <Path
                                          d={`M ${polarToCartesian(centerX, centerY, innerRadius, slot.endAngle).x} ${polarToCartesian(centerX, centerY, innerRadius, slot.endAngle).y} L ${polarToCartesian(centerX, centerY, outerRadius, slot.endAngle).x} ${polarToCartesian(centerX, centerY, outerRadius, slot.endAngle).y}`}
                                          fill="none"
                                          stroke={colorScheme === 'dark' ? theme.colors.primary[800] : theme.colors.primary[50]}
                                          strokeWidth="5"
                                          strokeLinecap="round"
                                      />
                                  </>
                              )}
                          </G>
                     );
                 })}

                {/* 중앙 텍스트 - 항상 표시 */}
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
            
            {/* 터치 오버레이 - 각 슬롯별 터치 영역 */}
            {slots.map((slot) => {
                // 슬롯의 중앙 각도 계산
                const midAngle = (slot.startAngle + slot.endAngle) / 2;
                const midAngleRad = (midAngle - 90) * Math.PI / 180; // -90도 보정
                
                // 중앙점에서의 위치 계산
                const midRadius = (innerRadius + outerRadius) / 2;
                const touchX = centerX + midRadius * Math.cos(midAngleRad);
                const touchY = centerY + midRadius * Math.sin(midAngleRad);
                
                // 터치 영역 크기 (각도에 따라 조정)
                const angleSpan = slot.endAngle - slot.startAngle;
                const touchSize = Math.max(30, angleSpan * 0.8); // 최소 30px, 각도에 비례
                
                return (
                    <TouchableOpacity
                        key={`touch-${slot.slotId}`}
                        style={[
                            styles.touchOverlay,
                            {
                                left: touchX - touchSize / 2,
                                top: touchY - touchSize / 2,
                                width: touchSize,
                                height: touchSize,
                            }
                        ]}
                        onPress={() => {
                            console.log('[AccountDonutChart] 슬롯 터치:', slot.name);
                            onSlotPress?.(slot);
                        }}
                        activeOpacity={0.7}
                    />
                );
            })}
            </View>

            {/* 범례 */}
            <View style={styles.legend}>
                {filteredData.map((slot) => {
                    const remainPercentage = slot.currentBudget > 0 ? (slot.remainingBudget / slot.currentBudget * 100).toFixed(0) : '0';
                    const isOverBudget = slot.remainingBudget < 0;
                    const slotColor = SLOT_CATEGORIES[slot.slotId as keyof typeof SLOT_CATEGORIES]?.color || '#F1A791';
                    return (
                        <TouchableOpacity 
                            key={slot.slotId} 
                            style={[styles.legendItem, isOverBudget && styles.legendItemOverBudget]}
                            onPress={() => onSlotPress?.(slot)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.legendColor, 
                                { 
                                    backgroundColor: isOverBudget ? '#FF4444' : slotColor,
                                    borderWidth: isOverBudget ? 2 : 0,
                                    borderColor: isOverBudget ? '#CC0000' : 'transparent',
                                    shadowColor: isOverBudget ? '#FF4444' : 'transparent',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: isOverBudget ? 0.3 : 0,
                                    shadowRadius: isOverBudget ? 2 : 0,
                                }
                            ]} />
                            <Text style={[
                                styles.legendText, 
                                { 
                                    color: isOverBudget ? '#CC0000' : theme.colors.text.primary,
                                    fontWeight: isOverBudget ? 'bold' : 'normal',
                                }
                            ]}>
                                {slot.name} {remainPercentage}%
                                {isOverBudget && ' ⚠️'}
                            </Text>
                        </TouchableOpacity>
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
               slot.currentBudget === nextSlot.currentBudget &&
               slot.remainingBudget === nextSlot.remainingBudget;
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
    chartContainer: {
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
    },
    touchOverlay: {
        position: "absolute",
        backgroundColor: "transparent",
        borderRadius: 50,
        // 디버깅용: backgroundColor: "rgba(255, 0, 0, 0.1)", // 빨간색 반투명으로 터치 영역 확인 가능
    },
    emptyText: {
        fontSize: 14,
        textAlign: "center",
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
    legendItemOverBudget: {
        backgroundColor: '#FFE6E6', // 연한 빨간색 배경
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FF4444', // 연한 빨간색 테두리
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
