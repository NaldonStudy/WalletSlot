import { useQuery } from "@tanstack/react-query";
import { slotApi, queryKeys } from "@/src/api";
import type { SlotDailySpendingResponse, BaseResponse } from "@/src/types";

/**
 * 특정 슬롯의 날짜별 지출 합계 조회 훅
 * 
 * @param accountId - 계좌 ID
 * @param accountSlotId - 계좌 슬롯 ID
 */
export const useSlotDailySpending = (accountId?: string, accountSlotId?: string) => {
    return useQuery<
      BaseResponse<SlotDailySpendingResponse>, // 원래 API 응답 타입
      Error,
      SlotDailySpendingResponse                // select로 가공 후 최종 반환 타입
    >({
      queryKey: accountId && accountSlotId
        ? queryKeys.slots.dailySpending(accountId, accountSlotId)
        : ["slots", "dailySpending", "undefined"],
      queryFn: async () => {
        if (!accountId || !accountSlotId) {
          throw new Error("accountId와 accountSlotId가 필요합니다");
        }
        return await slotApi.getSlotDailySpending(accountId, accountSlotId);
      },
      select: (res) => res.data, // ✅ BaseResponse → 실제 데이터만 반환
      enabled: !!accountId && !!accountSlotId,
      staleTime: 1 * 60 * 1000, // 1분간 fresh 상태 유지
      gcTime: 5 * 60 * 1000,    // 5분간 캐시 유지
    });
  };