import { CommonCard } from '@/src/components';
import React from 'react';
import { Text } from 'react-native';

/**
 * 기존 SettingCard를 CommonCard로 교체한 예시
 * 
 * @deprecated 이 컴포넌트는 CommonCard로 대체되었습니다.
 * @see CommonCard
 */
export function SettingCardExample({ children }: { children: React.ReactNode }) {
  return (
    <CommonCard
      variant="outlined"
      size="md"
      padding="md"
      margin="sm"
      testID="setting-card"
    >
      {children}
    </CommonCard>
  );
}

/**
 * 기존 UncategorizedSlotCard 스타일을 CommonCard로 재현한 예시
 */
export function SlotCardExample({ title, amount }: { title: string; amount: string }) {
  return (
    <CommonCard
      variant="elevated"
      size="lg"
      shadow
      borderRadius="md"
      padding="md"
      testID="slot-card"
    >
      <Text>{title}: {amount}</Text>
    </CommonCard>
  );
}

/**
 * 리포트 카드 스타일 예시
 */
export function ReportCardExample({ children }: { children: React.ReactNode }) {
  return (
    <CommonCard
      variant="filled"
      borderRadius="lg"
      padding="lg"
      margin="md"
      testID="report-card"
    >
      {children}
    </CommonCard>
  );
}