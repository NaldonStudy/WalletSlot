import type { SpendingReport, SpendingReportResponse } from '@/src/types/report';
import { apiClient } from './client';
import { fetchJsonFallback, isAmbiguousAxiosBody } from './responseNormalizer';

/**
 * 전체 계좌 통합 소비 레포트를 조회합니다.
 * @returns 소비 레포트 데이터
 */
const createFallbackReportData = (): SpendingReport => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    period: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      baseDay: 25
    },
    budgetComparison: {
      totalBudget: 3000000,
      totalSpent: 2750000,
      changePercent: 8.5,
      transactionCount: 12
    },
    categoryAnalysis: [
      {
        categoryId: 1,
        categoryName: '식비',
        slotName: '식비 슬롯',
        budgetAmount: 800000,
        spentAmount: 950000,
        changePercent: 18.8,
        spendingRatio: 1.1875,
        status: 'over' as const
      },
      {
        categoryId: 2,
        categoryName: '교통비',
        slotName: '교통비 슬롯',
        budgetAmount: 300000,
        spentAmount: 280000,
        changePercent: -6.7,
        spendingRatio: 0.933,
        status: 'optimal' as const
      },
      {
        categoryId: 3,
        categoryName: '카페/간식',
        slotName: '카페/간식 슬롯',
        budgetAmount: 200000,
        spentAmount: 150000,
        changePercent: -25.0,
        spendingRatio: 0.75,
        status: 'under' as const
      }
    ],
    peerComparison: {
      demographicInfo: {
        ageGroup: '20대',
        gender: 'M' as const,
        incomeRange: '300-400만원'
      },
      categories: [
        {
          categoryName: '식비',
          mySpending: 950000,
          peerAverage: 750000,
          comparisonPercent: 127
        },
        {
          categoryName: '교통비',
          mySpending: 280000,
          peerAverage: 320000,
          comparisonPercent: 88
        }
      ]
    },
    topSpendingCategories: [
      {
        categoryName: '식비',
        slotName: '식비 슬롯',
        amount: 950000,
        percentage: 35
      },
      {
        categoryName: '교통비',
        slotName: '교통비 슬롯',
        amount: 280000,
        percentage: 10
      },
      {
        categoryName: '카페/간식',
        slotName: '카페/간식 슬롯',
        amount: 150000,
        percentage: 5
      }
    ],
    budgetSuggestion: {
      totalSuggested: 3100000,
      categories: [
        {
          categoryName: '식비',
          currentBudget: 800000,
          suggestedBudget: 750000,
          reason: '지난달 지출 패턴을 고려한 조정'
        }
      ]
    },
    personalizedInsight: {
      spendingType: '외식형',
      spendingTypeDescription: '외식과 배달음식을 자주 이용하는 유형입니다.',
      suggestions: [
        {
          title: '지출 최적화 제안',
          description: '가장 효과적인 절약 방법을 제안드려요',
          actionItems: [
            '외식비를 주 2회로 제한해 보세요',
            '구독 서비스를 정리해 보세요'
          ]
        }
      ],
      strengths: ['교통비 관리를 잘하고 있어요'],
      improvements: ['외식비 지출이 다소 높아요']
    }
  };
};

export const getSpendingReport = async (): Promise<SpendingReport> => {
  try {
    // 개발 환경에서 MSW가 준비되지 않았을 경우를 대비한 대기
    if (__DEV__) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const response = await apiClient.get<SpendingReportResponse>(`/api/reports/spending`);
    
    // HTML 응답인지 확인 (MSW 실패 감지)
    if (response && typeof response.data === 'string' && (response.data as string).includes('<!DOCTYPE html>')) {
      if (__DEV__) {
        return createFallbackReportData();
      }
      throw new Error('MSW Mock 서버가 제대로 동작하지 않습니다. 앱을 재시작해주세요.');
    }
    
    // apiClient의 응답이 정상적이지 않은 경우 폴백 처리
    if (!response || isAmbiguousAxiosBody(response)) {
      const json = await fetchJsonFallback(`/api/reports/spending`);
      
      if (json && typeof json === 'object' && json.data) {
        return json.data as SpendingReport;
      }
      
      if (__DEV__) {
        return createFallbackReportData();
      }
      throw new Error('소비 레포트 데이터를 가져올 수 없습니다.');
    }
    
    // response.data가 이미 SpendingReport 형태인지 확인
    if (response.data && typeof response.data === 'object') {
      // MSW에서 BaseResponse<SpendingReport> 형태로 반환하는 경우
      if ('success' in response.data && 'data' in response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      // response.data가 직접 SpendingReport인 경우
      if ('period' in response.data && 'budgetComparison' in response.data) {
        return response.data as unknown as SpendingReport;
      }
    }
    
    if (__DEV__) {
      return createFallbackReportData();
    }
    throw new Error('소비 레포트 데이터 구조가 올바르지 않습니다.');
  } catch (error) {
    // 개발 환경에서 완전한 실패 시 더미 데이터 제공
    if (__DEV__) {
      return createFallbackReportData();
    }
    
    // 개발 환경에서 MSW 실패 시 더 자세한 안내
    if (__DEV__ && error instanceof Error && error.message.includes('HTML')) {
      throw new Error(`MSW Mock 서버 오류: ${error.message}\n\n해결 방법:\n1. 앱을 완전히 종료한 후 재시작\n2. Metro bundler 재시작 (npx expo start --clear)\n3. 캐시 클리어 후 재빌드`);
    }
    
    throw error;
  }
};

export const reportApi = {
  getSpendingReport,
};