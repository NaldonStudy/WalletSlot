import { useQuery } from "@tanstack/react-query";
import { slotApi, queryKeys } from "@/src/api";
import type { SlotData, SlotsResponse, BaseResponse } from "@/src/types";

type UseSlotsOptions = {
  enabled?: boolean;
};

export const useSlots = (accountId?: string, options: UseSlotsOptions = {}) => {
  const {
    data: slots,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<any, Error, SlotData[]>({
    queryKey: accountId ? queryKeys.slots.byAccount(accountId) : ['slots', 'byAccount', 'undefined'],
    queryFn: async () => {
      const result = await slotApi.getSlotsByAccount(accountId!);
      return result;
    },
    staleTime: 1 * 60 * 1000, // 1분간 fresh 상태 유지
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
    enabled: !!accountId && options.enabled !== false,
    // 캐시 무효화 시 자동으로 refetch
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    select: (res) => {
      // MSW 응답 구조에 따른 유연한 처리
      let slots = [];
      
      // Case 1: { data: { slots: [...] } } - 표준 구조
      if (res && res.data && res.data.slots) {
        slots = res.data.slots;
      }
      // Case 2: { slots: [...] } - 직접 구조 (MSW에서 직접 보내는 경우)
      else if (res && res.slots) {
        slots = res.slots;
      }
      // Case 3: 빈 응답 또는 예상하지 못한 구조
      else {
        console.warn('[useSlots] 예상하지 못한 응답 구조:', res);
        return [];
      }
      
      return slots;
    },
  });

  if (isError && error) {
    console.error('[useSlots] 에러 발생:', error.message);
  }

  return {
    slots: slots || [],
    isLoading,
    isError,
    error,
    refetch,
  };
};
