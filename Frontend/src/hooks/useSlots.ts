import { useQuery } from "@tanstack/react-query";
import { slotApi, queryKeys } from "@/src/api";
import type { SlotData, SlotsResponse, BaseResponse } from "@/src/types";

type UseSlotsOptions = {
  enabled?: boolean;
};

export const useSlots = (accountId?: string, options: UseSlotsOptions = {}) => {
  const {
    data: slots = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<BaseResponse<SlotsResponse>, Error, SlotData[]>({
    queryKey: accountId ? queryKeys.slots.byAccount(accountId) : ['slots', 'byAccount', 'undefined'],
    queryFn: async () => {
      const result = await slotApi.getSlotsByAccount(accountId!);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
    enabled: !!accountId && options.enabled !== false,
    select: (res) => {
      return res.data.slots;
    },
  });

  return {
    slots,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export const useSlotDetail = (slotId?: string) => {
  const {
    data: slot,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<BaseResponse<SlotData>, Error, SlotData>({
    queryKey: ['slots', 'detail', slotId],
    queryFn: async () => {
      const result = await slotApi.getSlotDetail(slotId!);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
    enabled: !!slotId,
    select: (res) => {
      return res.data;
    },
  });

  return {
    slot,
    isLoading,
    isError,
    error,
    refetch,
  };
};