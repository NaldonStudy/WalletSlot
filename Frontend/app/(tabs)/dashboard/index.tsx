import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { faker } from '@faker-js/faker';
import { Button } from '@/src/components';
import { themes, Spacing, Typography } from '@/src/constants/theme';
import AccountCarousel from '@/src/components/account/AccountCarousel';
import { BANK_CODES } from '@/src/constants/banks';


// 현실적인 샘플 데이터 생성
const generateUserData = () => {
  const koreanLastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
  const koreanFirstNames = ['민수', '영희', '철수', '수빈', '지현', '준호', '혜진', '동훈', '소영', '태현'];

  const lastName = faker.helpers.arrayElement(koreanLastNames);
  const firstName = faker.helpers.arrayElement(koreanFirstNames);
  return { userName: lastName + firstName };
};

const generateAccountCardData = () => {
  const bankCodes = ['004', '088', '020', '001', '002', '003', '011', '023', '027', '031', '034', '035', '037', '039', '045', '081', '090', '999'];
  const bankCode = faker.helpers.arrayElement(bankCodes) as keyof typeof BANK_CODES;
  const balance = faker.number.int({ min: 500000, max: 5000000 });
  const accountName = faker.helpers.arrayElement(['주거래계좌', '급여계좌', '저축계좌', '주택금융', '자유적금']);
  const accountNumber = faker.finance.accountNumber(12).replace(/(\d{4})(\d{2})(\d{6})/, '$1-$2-$3');
  return {
    bankCode,
    accountName,
    accountNumber,
    balanceFormatted: `${balance.toLocaleString()}원`
  };
};

const generateAccountCards = (count = 3) => {
  return Array.from({ length: count }).map(() => generateAccountCardData());
};


const generateSampleSlots = () => {
  const slotTypes = [
    { name: '식비', emoji: '🍽️', avgBudget: 400000 },
    { name: '교통비', emoji: '🚗', avgBudget: 150000 },
    { name: '쇼핑', emoji: '🛍️', avgBudget: 300000 },
    { name: '엔터테인먼트', emoji: '🎮', avgBudget: 200000 },
    { name: '카페/음료', emoji: '☕', avgBudget: 100000 },
    { name: '의료/건강', emoji: '🏥', avgBudget: 150000 },
    { name: '저축', emoji: '💰', avgBudget: 500000 },
    { name: '생활용품', emoji: '🧴', avgBudget: 200000 },
  ];

  // 5-7개의 랜덤한 슬롯 생성
  const numSlots = faker.number.int({ min: 5, max: 7 });
  const selectedSlots = faker.helpers.arrayElements(slotTypes, numSlots);

  return selectedSlots.map((slotType, index) => {
    const budget = faker.number.int({
      min: slotType.avgBudget * 0.7,
      max: slotType.avgBudget * 1.3
    });

    // 일부 슬롯은 예산 초과하도록 설정
    const shouldExceed = faker.datatype.boolean(0.2); // 20% 확률로 예산 초과
    const currentAmount = shouldExceed
      ? faker.number.int({ min: budget * 1.1, max: budget * 1.4 })
      : faker.number.int({ min: 0, max: budget * 0.9 });

    return {
      slotId: index + 1,
      slotName: slotType.name,
      emoji: slotType.emoji,
      budget,
      currentAmount: Math.round(currentAmount / 1000) * 1000, // 천원 단위로 반올림
    };
  });
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = themes[colorScheme];

  // 컴포넌트 렌더링 시마다 새로운 데이터 생성 (실제로는 API에서 가져올 데이터)
  const userData = generateUserData();
  const accountCardsData = generateAccountCards(4);
  const sampleSlots = generateSampleSlots();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: theme.colors.text.primary }]}>안녕하세요, {userData.userName}님!</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>오늘의 지출 현황을 확인해보세요</Text>
        </View>

        {/* 계좌 정보 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            내 계좌
          </Text>
        </View>
        <AccountCarousel accounts={accountCardsData} />



        {/* 슬롯 현황 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>이번 달 슬롯 현황</Text>

          {/* 원형 그래프 영역 (추후 구현) */}
          <View style={[styles.chartPlaceholder, { backgroundColor: theme.colors.gray[100] }]}>
            <Text style={[styles.placeholderText, { color: theme.colors.text.secondary }]}>원형 그래프 영역</Text>
            <Text style={[styles.placeholderSubtext, { color: theme.colors.text.tertiary }]}>슬롯별 지출 현황</Text>
          </View>
        </View>

        {/* 슬롯 리스트 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>슬롯 목록</Text>

          {/* 샘플 슬롯 카드들 */}
          {sampleSlots.map((slot) => (
            <View key={slot.slotId} style={[styles.slotCard, {
              backgroundColor: theme.colors.background.primary,
              borderColor: theme.colors.border.light,
            }]}>
              <View style={styles.slotHeader}>
                <View style={styles.slotInfo}>
                  <Text style={styles.slotEmoji}>{slot.emoji}</Text>
                  <Text style={[styles.slotName, { color: theme.colors.text.primary }]}>{slot.slotName}</Text>
                </View>
                <Text style={[styles.slotAmount, { color: theme.colors.text.secondary }]}>
                  {slot.currentAmount.toLocaleString()}원 / {slot.budget.toLocaleString()}원
                </Text>
              </View>

              {/* 진행률 바 */}
              <View style={[styles.progressContainer, { backgroundColor: theme.colors.gray[200] }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min((slot.currentAmount / slot.budget) * 100, 100)}%`,
                      backgroundColor: slot.currentAmount > slot.budget ? theme.colors.error : theme.colors.primary[500]
                    }
                  ]}
                />
              </View>

              <View style={styles.slotActions}>
                <Button
                  title="수정"
                  variant="outline"
                  size="sm"
                  onPress={() => console.log('수정', slot.slotId)}
                />
                <Button
                  title="내역"
                  variant="ghost"
                  size="sm"
                  onPress={() => console.log('내역', slot.slotId)}
                />
              </View>
            </View>
          ))}
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.base,
    paddingTop: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
  },
  accountCard: {
    margin: Spacing.base,
    padding: Spacing.lg,
    borderRadius: 16,
  },
  accountTitle: {
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.xs,
  },
  balance: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  uncategorized: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.8,
  },
  section: {
    padding: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.base,
  },
  chartPlaceholder: {
    height: 200,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  placeholderText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
  },
  placeholderSubtext: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  slotCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotEmoji: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.sm,
  },
  slotName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  slotAmount: {
    fontSize: Typography.fontSize.sm,
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  slotActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bottomSpacer: {
    height: 100, // 탭 바와의 간격
  },
});
