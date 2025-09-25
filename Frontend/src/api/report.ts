import { API_ENDPOINTS } from '@/src/constants/api';
import type { SpendingReport, SpendingReportResponse } from '@/src/types/report';
import { apiClient } from './client';
import { fetchJsonFallback, isAmbiguousAxiosBody } from './responseNormalizer';

/**
 * 전체 계좌 통합 소비 레포트를 조회합니다.
 * @param options 조회 옵션 (기간 오프셋 등)
 * @returns 소비 레포트 데이터
 */
const createFallbackReportData = (periodOffset: number = 0): SpendingReport => {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + periodOffset, 1);
  const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
  
  // 기간에 따른 차별화된 데이터 생성
  const periodMultiplier = Math.max(0.5, 1 + (periodOffset * 0.15)); // 이전 달일수록 지출 적음
  const randomFactor = Math.sin(periodOffset * 2.5) * 0.1 + 1; // 약간의 랜덤성 추가
  
  const baseBudget = Math.round(3000000 * periodMultiplier);
  const baseSpent = Math.round(baseBudget * (0.85 + Math.abs(periodOffset) * 0.05) * randomFactor);
  
  return {
    period: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      baseDay: 25
    },
    budgetComparison: {
      totalBudget: baseBudget,
      totalSpent: baseSpent,
      changePercent: Math.round((baseSpent / baseBudget - 1) * 100 * 10) / 10,
      transactionCount: Math.round(12 + periodOffset * -2 + Math.random() * 4)
    },
    categoryAnalysis: [
      {
        categoryId: 1,
        categoryName: '식비',
        slotName: '식비 슬롯',
        budgetAmount: Math.round(800000 * periodMultiplier),
        spentAmount: Math.round(800000 * periodMultiplier * (1.1 + periodOffset * 0.05)),
        changePercent: Math.round((18.8 + periodOffset * 3) * 10) / 10,
        spendingRatio: 1.1875 + periodOffset * 0.05,
        status: (Math.abs(periodOffset) % 3 === 0) ? 'over' as const : 'optimal' as const
      },
      {
        categoryId: 2,
        categoryName: '교통비',
        slotName: '교통비 슬롯',
        budgetAmount: Math.round(300000 * periodMultiplier),
        spentAmount: Math.round(300000 * periodMultiplier * (0.9 + Math.abs(periodOffset) * 0.03)),
        changePercent: Math.round((-6.7 + periodOffset * 2) * 10) / 10,
        spendingRatio: 0.933 + Math.abs(periodOffset) * 0.02,
        status: 'optimal' as const
      },
      {
        categoryId: 3,
        categoryName: '카페/간식',
        slotName: '카페/간식 슬롯',
        budgetAmount: Math.round(200000 * periodMultiplier),
        spentAmount: Math.round(200000 * periodMultiplier * (0.75 - periodOffset * 0.1)),
        changePercent: Math.round((-25.0 - periodOffset * 5) * 10) / 10,
        spendingRatio: Math.max(0.5, 0.75 - Math.abs(periodOffset) * 0.1),
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
          mySpending: Math.round(800000 * periodMultiplier * (1.1 + periodOffset * 0.05)),
          peerAverage: Math.round(750000 * periodMultiplier),
          comparisonPercent: Math.round(127 + periodOffset * 3)
        },
        {
          categoryName: '교통비',
          mySpending: Math.round(300000 * periodMultiplier * (0.9 + Math.abs(periodOffset) * 0.03)),
          peerAverage: Math.round(320000 * periodMultiplier),
          comparisonPercent: Math.round(88 - periodOffset * 2)
        }
      ]
    },
    topSpendingCategories: [
      {
        categoryName: '식비',
        slotName: '식비 슬롯',
        amount: Math.round(800000 * periodMultiplier * (1.1 + periodOffset * 0.05)),
        percentage: 35 + periodOffset
      },
      {
        categoryName: '교통비',
        slotName: '교통비 슬롯',
        amount: Math.round(300000 * periodMultiplier * (0.9 + Math.abs(periodOffset) * 0.03)),
        percentage: Math.max(5, 10 - Math.abs(periodOffset))
      },
      {
        categoryName: '카페/간식',
        slotName: '카페/간식 슬롯',
        amount: Math.round(200000 * periodMultiplier * (0.75 - periodOffset * 0.1)),
        percentage: Math.max(3, 5 - Math.abs(periodOffset))
      }
    ],
    budgetSuggestion: {
      totalSuggested: Math.round(baseBudget * 1.03),
      categories: [
        {
          categoryName: '식비',
          currentBudget: Math.round(800000 * periodMultiplier),
          suggestedBudget: Math.round(750000 * periodMultiplier),
          reason: periodOffset === 0 ? '지난달 지출 패턴을 고려한 조정' : '과거 지출 데이터 기반 최적화'
        }
      ]
    },
    personalizedInsight: {
      spendingType: periodOffset % 2 === 0 ? '외식형' : '절약형',
      spendingTypeDescription: periodOffset % 2 === 0 ? 
        '외식과 배달음식을 자주 이용하는 유형입니다.' : 
        '계획적이고 절약을 잘하는 유형입니다.',
      suggestions: [
        {
          title: periodOffset === 0 ? '지출 최적화 제안' : '과거 지출 패턴 분석',
          description: periodOffset === 0 ? 
            '가장 효과적인 절약 방법을 제안드려요' : 
            '이 기간의 지출 특성을 분석했어요',
          actionItems: periodOffset === 0 ? [
            '외식비를 주 2회로 제한해 보세요',
            '구독 서비스를 정리해 보세요'
          ] : [
            `${Math.abs(periodOffset)}개월 전 지출 패턴 검토`,
            '현재와 비교하여 개선점 찾기'
          ]
        }
      ],
      strengths: periodOffset === 0 ? ['교통비 관리를 잘하고 있어요'] : ['과거 대비 지출 관리가 개선되었어요'],
      improvements: periodOffset === 0 ? ['외식비 지출이 다소 높아요'] : ['당시 카페/간식비가 높았어요']
    }
  };
};

export const getSpendingReport = async (options?: { periodOffset?: number }): Promise<SpendingReport> => {
  try {
    // 개발 환경에서 MSW가 준비되지 않았을 경우를 대비한 대기
    if (__DEV__) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 기간 오프셋이 있는 경우 쿼리 파라미터에 추가
    const url = options?.periodOffset 
      ? `${API_ENDPOINTS.REPORTS_SPENDING}?periodOffset=${options.periodOffset}`
      : API_ENDPOINTS.REPORTS_SPENDING;
    
    const response = await apiClient.get<SpendingReportResponse>(url);
    
    // HTML 응답인지 확인 (MSW 실패 감지)
    if (response && typeof response.data === 'string' && (response.data as string).includes('<!DOCTYPE html>')) {
      if (__DEV__) {
        return createFallbackReportData(options?.periodOffset ?? 0);
      }
      throw new Error('MSW Mock 서버가 제대로 동작하지 않습니다. 앱을 재시작해주세요.');
    }
    
    // apiClient의 응답이 정상적이지 않은 경우 폴백 처리
    if (!response || isAmbiguousAxiosBody(response)) {
      const json = await fetchJsonFallback(url);
      
      if (json && typeof json === 'object' && json.data) {
        return json.data as SpendingReport;
      }
      
      if (__DEV__) {
        return createFallbackReportData(options?.periodOffset ?? 0);
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
      return createFallbackReportData(options?.periodOffset ?? 0);
    }
    throw new Error('소비 레포트 데이터 구조가 올바르지 않습니다.');
  } catch (error) {
    // 개발 환경에서 완전한 실패 시 더미 데이터 제공
    if (__DEV__) {
      return createFallbackReportData(options?.periodOffset ?? 0);
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