import React from "react";
import { View, StyleSheet, useColorScheme } from "react-native";
import CumulativeSpendingChart from "@/src/components/common/CumulativeSpendingChart";
import { SlotDailySpendingResponse } from "@/src/types";
import { themes } from "@/src/constants/theme";

type SlotSpendingChartProps = {
  data: SlotDailySpendingResponse;
  slotName: string;
  color?: string;
  budget: number;
  isUncategorized?: boolean; // 미분류 슬롯 여부
};

const SlotSpendingChart: React.FC<SlotSpendingChartProps> = ({
  data,
  color = "#4F46E5",
  budget,
  isUncategorized = false,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = themes[colorScheme];

  const transactions = data?.transactions || [];

  // 미분류 슬롯인 경우 예산을 0으로 설정하여 기준선 제거
  const effectiveBudget = isUncategorized ? 0 : budget;

  return (
    <View
      style={[
        styles.container,
        theme.shadows.base,
        {
          backgroundColor: theme.colors.background.primary,
          borderColor: theme.colors.border.light,
          borderWidth: 1,
        },
      ]}
    >
      <CumulativeSpendingChart data={transactions}
        budget={effectiveBudget}
        color={color}
        isUncategorized={isUncategorized} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 4,  // 패딩을 줄여서 차트 공간 확보
    height: 200,  // 고정 높이 설정
  },
});

export default SlotSpendingChart;
