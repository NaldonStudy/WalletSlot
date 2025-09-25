import { API_ENDPOINTS } from '@/src/constants/api';
import type { BaseResponse, SpendingReport } from '@/src/types';
import { faker } from '@faker-js/faker';
import { http, HttpResponse } from 'msw';

// faker.js 설정 (최신 버전에서는 locale 설정 방식이 다름)

// 실제 슬롯 카테고리 사용
const CATEGORY_NAMES = [
  '식비', '교통비', '의류/잡화', '카페/간식', '여가비', '의료/건강', 
  '저축', '자동차비', '미용', '취미', '보험비', '통신비', '주거비', 
  '구독비', '육아비', '용돈/선물', '반려동물', '데이트', '세금', 
  '교육비', '경조사', '회비', '후원', '여행/숙박'
];

// 소비 유형 리스트
const SPENDING_TYPES = [
  { type: '외식형', description: '외식과 배달음식을 자주 이용하는 유형입니다.' },
  { type: '쇼핑형', description: '온라인/오프라인 쇼핑을 즐기는 유형입니다.' },
  { type: '문화형', description: '영화, 공연, 전시 등 문화생활을 중시하는 유형입니다.' },
  { type: '실용형', description: '필요한 것만 구매하는 합리적인 소비 유형입니다.' },
  { type: '투자형', description: '자기계발과 투자에 관심이 많은 유형입니다.' }
];

/**
 * 더미 소비 레포트 데이터 생성 (전체 계좌 통합)
 */
const generateSpendingReport = (): SpendingReport => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // 기간 정보
  const period = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    baseDay: faker.number.int({ min: 1, max: 28 })
  };

  // 예산 vs 실제 지출
  const totalBudget = faker.number.int({ min: 2000000, max: 4000000 });
  const totalSpent = faker.number.int({ min: 1500000, max: totalBudget + 500000 });
  const budgetComparison = {
    totalBudget,
    totalSpent,
    changePercent: faker.number.float({ min: -15, max: 25, fractionDigits: 1 }),
    transactionCount: faker.number.int({ min: 8, max: 20 })
  };

  // 카테고리별 지출 분석
  const categoryCount = faker.number.int({ min: 3, max: 6 });
  const categories = faker.helpers.arrayElements(CATEGORY_NAMES, categoryCount);
  
  const categoryAnalysis = categories.map((categoryName, index) => {
    const budgetAmount = faker.number.int({ min: 200000, max: 800000 });
    const spentAmount = faker.number.int({ min: 100000, max: budgetAmount + 200000 });
    const spendingRatio = spentAmount / budgetAmount;
    
    let status: 'under' | 'optimal' | 'over';
    if (spendingRatio < 0.9) status = 'under';
    else if (spendingRatio <= 1.0) status = 'optimal';
    else status = 'over';

    return {
      categoryId: index + 1,
      categoryName,
      slotName: `${categoryName} 슬롯`,
      budgetAmount,
      spentAmount,
      changePercent: faker.number.float({ min: -20, max: 30, fractionDigits: 1 }),
      spendingRatio,
      status
    };
  });

  // 또래 비교 데이터
  const ageGroups = ['20대', '30대', '40대'];
  const incomeRanges = ['200-300만원', '300-400만원', '400-500만원'];
  
  const peerComparison = {
    demographicInfo: {
      ageGroup: faker.helpers.arrayElement(ageGroups),
      gender: faker.helpers.arrayElement(['M', 'F']) as 'M' | 'F',
      incomeRange: faker.helpers.arrayElement(incomeRanges)
    },
    categories: categories.slice(0, 3).map(categoryName => {
      const mySpending = faker.number.int({ min: 300000, max: 700000 });
      const peerAverage = faker.number.int({ min: 250000, max: 600000 });
      
      return {
        categoryName,
        mySpending,
        peerAverage,
        comparisonPercent: Math.round((mySpending / peerAverage) * 100)
      };
    })
  };

  // 상위 3대 지출 카테고리
  const topSpendingCategories = categoryAnalysis
    .sort((a, b) => b.spentAmount - a.spentAmount)
    .slice(0, 3)
    .map((category, index) => ({
      categoryName: category.categoryName,
      slotName: category.slotName,
      amount: category.spentAmount,
      percentage: Math.round((category.spentAmount / totalSpent) * 100)
    }));

  // 다음 달 예산 제안
  const budgetSuggestion = {
    totalSuggested: faker.number.int({ min: totalBudget - 200000, max: totalBudget + 300000 }),
    categories: categories.slice(0, 3).map(categoryName => {
      const currentBudget = faker.number.int({ min: 200000, max: 600000 });
      const suggestedBudget = faker.number.int({ min: currentBudget - 50000, max: currentBudget + 100000 });
      
      const reasons = [
        '지난달 지출 패턴을 고려한 조정',
        '또래 평균 대비 적정 수준 유지',
        '절약 목표 달성을 위한 감소',
        '필수 지출 증가 반영',
        '계절적 요인 고려'
      ];
      
      return {
        categoryName,
        currentBudget,
        suggestedBudget,
        reason: faker.helpers.arrayElement(reasons)
      };
    })
  };

  // 개인화 인사이트
  const spendingTypeInfo = faker.helpers.arrayElement(SPENDING_TYPES);
  const personalizedInsight = {
    spendingType: spendingTypeInfo.type,
    spendingTypeDescription: spendingTypeInfo.description,
    suggestions: [
      {
        title: '지출 최적화 제안',
        description: '가장 효과적인 절약 방법을 제안드려요',
        actionItems: [
          '외식비를 주 2회로 제한해 보세요',
          '구독 서비스를 정리해 보세요',
          '할인 쿠폰을 적극 활용해 보세요'
        ]
      },
      {
        title: '목표 달성 전략',
        description: '다음 달 예산 목표를 달성하는 방법이에요',
        actionItems: [
          '주간 지출 한도를 설정해 보세요',
          '가계부 작성 습관을 만들어 보세요',
          '고정비를 먼저 분리해 보세요'
        ]
      }
    ],
    strengths: [
      '교통비 관리를 잘하고 있어요',
      '계획적인 쇼핑 습관이 있어요',
      '예산 내에서 지출하려고 노력해요'
    ],
    improvements: [
      '외식비 지출이 다소 높아요',
      '충동구매를 줄여보세요',
      '고정비를 재검토해 보세요'
    ]
  };

  return {
    period,
    budgetComparison,
    categoryAnalysis,
    peerComparison,
    topSpendingCategories,
    budgetSuggestion,
    personalizedInsight
  };
};

export const reportHandlers = [
  // 전체 계좌 통합 소비 레포트 조회
  http.get(API_ENDPOINTS.REPORTS_SPENDING, (info) => {
    console.log('[MSW] 🎯 GET /api/reports/spending 핸들러 호출됨!');
    console.log('[MSW] Request info:', info.request.url);
    
    const reportData = generateSpendingReport();
    
    const response: BaseResponse<SpendingReport> = {
      success: true,
      data: reportData,
      message: '소비 레포트 조회 성공',
    };

    console.log('[MSW] 응답 데이터 생성 완료:', response.success);
    return HttpResponse.json(response);
  }),
];