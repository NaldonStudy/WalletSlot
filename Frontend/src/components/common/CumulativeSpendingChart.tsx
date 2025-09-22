import React, { useState } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent, TouchableWithoutFeedback } from "react-native";
import Svg, {
  Polyline,
  Circle as SvgCircle,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  Path,
  Line,
} from "react-native-svg";

type CumulativeSpendingChartProps = {
  data: { date: string; spent: number }[];
  budget: number;
  color?: string;
};

// padding을 방향별로 분리
const paddingLeft = 8;   // Y축 라벨 제거로 패딩 감소8
const paddingTop = 16;    // 위쪽 여백
const paddingRight = 8;   // 오른쪽 최소 여백
const paddingBottom = 8;  // 하단 최소 여백

const CumulativeSpendingChart: React.FC<CumulativeSpendingChartProps> = ({
  data,
  budget,
  color = "#F59E0B", // 기본 슬롯 색 (노랑 계열)
}) => {
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
  const [selectedPoint, setSelectedPoint] = useState<{ index: number; amount: number; date: string; dailySpent: number } | null>(null);

  let cumulative = 0;
  const cumulativeData = data.map((item) => {
    cumulative += item.spent;
    return { x: item.date, y: cumulative };
  });

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.summaryText}>차트 데이터가 없습니다</Text>
      </View>
    );
  }

  const actualMax = Math.max(...cumulativeData.map((d) => d.y));
  const maxY = Math.max(actualMax, budget);
  const minY = 0;
  const yRange = maxY - minY || 1;

  const handleLayout = (e: LayoutChangeEvent) => {
    setChartSize({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  const handlePointPress = (index: number) => {
    const point = cumulativeData[index];
    const originalData = data[index];
    setSelectedPoint({
      index,
      amount: point.y,
      date: originalData.date,
      dailySpent: originalData.spent,
    });
  };

  const handleBackgroundPress = () => {
    setSelectedPoint(null);
  };

  const { width: chartWidth, height: chartHeight } = chartSize;

  // Y 스케일
  const scaleY = (value: number) =>
    chartHeight -
    paddingBottom -
    ((value - minY) / yRange) *
      (chartHeight - paddingTop - paddingBottom);

  // X 스케일
  const scaleX = (index: number) =>
    paddingLeft +
    (index * (chartWidth - paddingLeft - paddingRight)) /
      (cumulativeData.length - 1);

  // Path (전체 지출 라인)
  const points =
    chartHeight > 0 && chartWidth > 0
      ? cumulativeData.map((p, i) => `${scaleX(i)},${scaleY(p.y)}`).join(" ")
      : "";

  // 영역 Path (예산 이하 부분)
  const areaPath = (() => {
    if (chartWidth === 0 || chartHeight === 0) return "";

    const firstX = scaleX(0);
    const bottomY = chartHeight - paddingBottom;

    let path = `M ${firstX} ${bottomY}`;
    cumulativeData.forEach((p, i) => {
      path += ` L ${scaleX(i)} ${scaleY(Math.min(p.y, budget))}`;
    });
    const lastX = scaleX(cumulativeData.length - 1);
    path += ` L ${lastX} ${bottomY} Z`;

    return path;
  })();

  // 초과 영역 Path (예산선 위의 영역)
  const overPath = (() => {
    if (chartWidth === 0 || chartHeight === 0 || actualMax <= budget) return "";
    
    let path = "";
    let started = false;
    let firstOverIndex = -1;
    let lastOverIndex = -1;

    // 예산을 초과하는 첫 번째와 마지막 인덱스 찾기
    cumulativeData.forEach((p, i) => {
      if (p.y > budget) {
        if (firstOverIndex === -1) firstOverIndex = i;
        lastOverIndex = i;
      }
    });

    if (firstOverIndex === -1) return "";

    // 예산선에서 시작
    const firstX = scaleX(firstOverIndex);
    const budgetY = scaleY(budget);
    path = `M ${firstX} ${budgetY}`;

    // 예산을 초과하는 모든 점들을 따라가기
    for (let i = firstOverIndex; i <= lastOverIndex; i++) {
      const p = cumulativeData[i];
      const x = scaleX(i);
      const y = scaleY(p.y);
      
      if (p.y > budget) {
        path += ` L ${x} ${y}`;
      } else {
        // 예산선 아래로 내려가면 예산선 높이로
        path += ` L ${x} ${budgetY}`;
      }
    }

    // 마지막 점에서 예산선으로 닫기
    const lastX = scaleX(lastOverIndex);
    path += ` L ${lastX} ${budgetY} Z`;

    return path;
  })();

  return (
    <TouchableWithoutFeedback onPress={handleBackgroundPress}>
      <View style={styles.container} onLayout={handleLayout}>
        {chartWidth > 0 && chartHeight > 0 && (
        <Svg width="100%" height="100%" style={{ overflow: "visible" }}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </LinearGradient>
            <LinearGradient id="overBudgetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.5" />
              <Stop offset="100%" stopColor="#EF4444" stopOpacity="0.3" />
            </LinearGradient>
          </Defs>

          {/* 예산선 */}
          <Line
            x1={paddingLeft}
            y1={scaleY(budget)}
            x2={chartWidth - paddingRight}
            y2={scaleY(budget)}
            stroke={actualMax > budget ? "#EF4444" : "#9CA3AF"}
            strokeDasharray="6 4"
            strokeWidth={2}
          />
          <SvgText
            x={paddingLeft + 4}
            y={scaleY(budget) - 6}
            fontSize="12"
            fill={actualMax > budget ? "#EF4444" : "#6B7280"}
            textAnchor="start"
          >
            예산 {budget.toLocaleString()}
          </SvgText>

          {/* 예산 이하 영역 */}
          <Path d={areaPath} fill="url(#areaGradient)" />

          {/* 예산 초과 영역 (빨간색) */}
          {actualMax > budget && overPath && (
            <Path d={overPath} fill="url(#overBudgetGradient)" />
          )}

          {/* 데이터 라인 */}
          <Polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 */}
          {cumulativeData.map((p, i) => (
            <SvgCircle
              key={i}
              cx={scaleX(i)}
              cy={scaleY(p.y)}
              r={selectedPoint?.index === i ? "6" : "4"}
              fill={selectedPoint?.index === i ? "#FF6B6B" : color}
              stroke="#fff"
              strokeWidth="2"
              onPress={() => handlePointPress(i)}
            />
          ))}


          {/* 최댓값 라벨 (오른쪽 점 위) */}
          <SvgText
            x={(() => {
              const rightEdge = chartWidth - paddingRight;
              const labelWidth = 60; // 라벨 예상 너비
              
              // 오른쪽 끝에서 라벨 너비의 절반만큼 뺀 위치로 고정
              return rightEdge - labelWidth / 2;
            })()}
            y={scaleY(cumulativeData[cumulativeData.length - 1].y) - 8}
            fontSize="11"
            fill={actualMax > budget ? "#EF4444" : "#666"}
            textAnchor="middle"
          >
            {cumulativeData[cumulativeData.length - 1].y.toLocaleString()}
          </SvgText>
        </Svg>
      )}
      
      {/* 선택된 점 정보 표시 - 점 아래에 툴팁 */}
      {selectedPoint && (
        <View
          style={[
            styles.tooltip,
            {
              position: 'absolute',
              left: (() => {
                const x = scaleX(selectedPoint.index);
                const tooltipWidth = 100; // 툴팁 최소 너비
                const padding = 8; // 화면 가장자리 여백
                
                // 첫 번째 점의 툴팁 왼쪽 위치를 기준으로 계산
                const firstPointX = scaleX(0);
                const firstPointTooltipLeft = Math.max(padding, firstPointX - tooltipWidth / 2);
                
                // 현재 점의 중앙 정렬 위치
                const centerAlignedX = x - tooltipWidth / 2;
                
                // 오른쪽 끝 제한 (화면 끝을 넘지 않게)
                const rightEdge = chartWidth - padding;
                const maxRightX = rightEdge - tooltipWidth;
                
                // 왼쪽과 오른쪽 모두 제한
                const constrainedX = Math.max(
                  firstPointTooltipLeft, // 첫 번째 점 툴팁 왼쪽 끝보다 왼쪽으로 가지 않음
                  Math.min(centerAlignedX, maxRightX) // 오른쪽 끝을 넘지 않게
                );
                
                return constrainedX;
              })(),
              top: scaleY(cumulativeData[selectedPoint.index].y) + 20, // 첫 번째 점보다 30px 아래
            }
          ]}
        >
          <Text style={styles.tooltipDate}>{selectedPoint.date}</Text>
          <Text style={styles.tooltipDaily}>
            당일: {selectedPoint.dailySpent.toLocaleString()}원
          </Text>
          <Text style={styles.tooltipAmount}>
            누적: {selectedPoint.amount.toLocaleString()}원
          </Text>
        </View>
      )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  tooltip: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipDate: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  tooltipDaily: {
    color: '#FFD700',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 2,
  },
  tooltipAmount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CumulativeSpendingChart;
