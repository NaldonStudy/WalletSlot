import { useQuery } from '@tanstack/react-query';
import { slotApi, queryKeys } from '@/src/api';
import type { Slot } from '@/src/types';

interface SlotForm {
  name: string;
  targetAmount: number;
  category: string;
  description?: string;
}

/**
 * 슬롯 관련 커스텀 훅 (기본 틀)
 * 추후 API 안정화에 따라 확장 예정
 */
export const useSlots = (accountId?: number) => {
  // 계좌별 슬롯 목록 조회 (현재 사용 가능한 API)
  const { 
    data: slotsData, 
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: accountId ? queryKeys.slots.byAccount(accountId) : ['slots', 'none'],
    queryFn: () => accountId ? slotApi.getSlotsByAccount(accountId) : null,
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
  });

  const slots = slotsData?.data || [];

  return {
    // 데이터
    slots,
    isLoading,
    error,
    
    // 액션 (추후 구현)
    createSlot: (data: SlotForm) => {
      console.log('Create slot:', data);
      // TODO: API 구현 후 활성화
    },
    
    // 유틸리티
    refetch,
    getTotalAmount: () => slots.reduce((sum: number, slot: Slot) => sum + (slot.targetMinor || 0), 0),
    getActiveSlots: () => slots.filter((slot: Slot) => slot.isActive),
    
    // 포맷팅
    formatSlotAmount: (amount: number) => 
      new Intl.NumberFormat('ko-KR').format(amount) + '원',
  };
};

/**
 * 개별 슬롯 상세 정보 훅 (기본 틀)
 */
export const useSlot = (slotId: number) => {
  const { 
    data: slotData, 
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.slots.detail(slotId),
    queryFn: () => slotApi.getSlotDetail(slotId),
    enabled: !!slotId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    slot: slotData?.data,
    isLoading,
    error,
  };
};

/**
 * 슬롯 추천 기능 훅 (추후 구현)
 */
export const useSlotRecommendations = () => {
  // TODO: API 파라미터 정리 후 구현
  return {
    recommendations: [],
    isLoading: false,
    refetch: () => {},
  };
};
