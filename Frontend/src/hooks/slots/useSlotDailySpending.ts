import { useQuery } from "@tanstack/react-query";
import { slotApi, queryKeys } from "@/src/api";
import type { SlotDailySpendingResponse, BaseResponse } from "@/src/types";

/**
 * 특정 슬롯의 날짜별 지출 합계 조회 훅
 * 
 * @param accountId - 계좌 ID
 * @param slotId - 슬롯 ID
 */
export const useSlotDailySpending = (accountId?: string, slotId?: string) => {
    return useQuery<
      BaseResponse<SlotDailySpendingResponse>, // 원래 API 응답 타입
      Error,
      SlotDailySpendingResponse                // select로 가공 후 최종 반환 타입
    >({
      queryKey: accountId && slotId
        ? queryKeys.slots.dailySpending(accountId, slotId)
        : ["slots", "dailySpending", "undefined"],
      queryFn: async () => {
        if (!accountId || !slotId) {
          throw new Error("accountId와 slotId가 필요합니다");
        }
        return await slotApi.getSlotDailySpending(accountId, slotId);
      },
      select: (res) => res.data, // ✅ BaseResponse → 실제 데이터만 반환
      enabled: !!accountId && !!slotId,
      staleTime: 5 * 60 * 1000, // 5분 캐시
      gcTime: 10 * 60 * 1000,   // 10분간 가비지 컬렉션 방지
    });
  };