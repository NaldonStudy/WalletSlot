import { apiClient } from '@/src/api/client';
import { normalizeSlots } from '@/src/api/responseNormalizer';
import { API_ENDPOINTS } from '@/src/constants/api';
import {
  ApiError,
  BaseResponse,
  SlotDailySpendingResponse,
  SlotHistoryResponse,
  SlotsResponse
} from '@/src/types';

/**
 * 슬롯 관련 API 서비스
 */
export const slotApi = {
  /**
   * 계좌별 슬롯 목록 조회
   */
  getSlotsByAccount: async (accountId: string): Promise<BaseResponse<SlotsResponse>> => {
    try {
    return await apiClient.get<SlotsResponse>(API_ENDPOINTS.ACCOUNT_SLOTS(accountId));
    } catch (error) {
      console.error(
        '[getSlotsByAccount] API 호출 실패:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  },

  /**
   * 계좌별 슬롯 하루 지출 합계 (그래프 용도)
   */
  getSlotDailySpending: async (accountId: string, accountSlotId: string): Promise<BaseResponse<SlotDailySpendingResponse>> => {
    try {
      console.log('[getSlotDailySpending] API 요청:', {
        accountId,
        accountSlotId,
        url: API_ENDPOINTS.ACCOUNT_SLOT_DAILY_SPENDING(accountId, accountSlotId)
      });
      
      const response = await apiClient.get<SlotDailySpendingResponse>(
        API_ENDPOINTS.ACCOUNT_SLOT_DAILY_SPENDING(accountId, accountSlotId)
      );
      
      console.log('[getSlotDailySpending] API 응답:', {
        success: response.success,
        message: response.message,
        data: response.data
      });
      
      // 날짜별 그룹화 및 합계 계산 (로그 없이)
      if (response.data && response.data.transactions) {
        const groupedByDate = response.data.transactions.reduce((acc, tx) => {
          if (acc[tx.date]) {
            acc[tx.date] += tx.spent;
          } else {
            acc[tx.date] = tx.spent;
          }
          return acc;
        }, {} as { [date: string]: number });
        
        const groupedTransactions = Object.entries(groupedByDate)
          .map(([date, spent]) => ({ date, spent }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        // 그룹화된 데이터로 응답 수정
        response.data.transactions = groupedTransactions;
      }
      
      return response;
    } catch (error) {
      const apiError = error as ApiError | Error;
      const message =
        (apiError as ApiError)?.message ??
        (apiError as Error)?.message ??
        '슬롯 하루 지출 합계 조회에 실패했습니다.';

      console.error('[getSlotDailySpending] API 호출 실패:', {
        message,
        error: apiError,
        accountId,
        accountSlotId
      });
      throw new Error(message);
    }
  },

  /**
   * 슬롯 예산 변경 히스토리 조회
   */
  getSlotHistory: async (accountId: string, slotId: string): Promise<BaseResponse<SlotHistoryResponse>> => {
    try {
      return await apiClient.get<SlotHistoryResponse>(
        API_ENDPOINTS.ACCOUNT_SLOT_HISTORY(accountId, slotId)
      );
    } catch (error) {
      const apiError = error as ApiError | Error;
      const message =
        (apiError as ApiError)?.message ??
        (apiError as Error)?.message ??
        '슬롯 히스토리 조회에 실패했습니다.';

      console.error('[getSlotHistory] API 호출 실패:', {
        message,
        error: apiError,
        accountId,
        slotId,
        url: `/api/accounts/${accountId}/slots/${slotId}/history`
      });
      throw new Error(message);
    }
  },

  /**
   * 예산안 확정 - 슬롯 리스트를 확정(reassign)
   * 요청 바디: { slots: SlotDto[] }
   */
  reassignSlots: async (accountId: string, slotsPayload: any): Promise<BaseResponse<SlotsResponse>> => {
    try {
      // API 문서 상으로는 PATCH /api/accounts/{accountId}/slots/reassign
      const url = API_ENDPOINTS.ACCOUNT_SLOT_REASSIGN(accountId);
      const response = await apiClient.patch(url, slotsPayload);

      // response가 애매한 형태일 수 있으므로 정규화 시도
      try {
        return normalizeSlots(response);
      } catch (e) {
        // 정규화 실패 시 원시 응답을 그대로 반환하려 시도
        return response as BaseResponse<SlotsResponse>;
      }
    } catch (error) {
      const apiError = error as ApiError | Error | any;
      const apiCode = (apiError as ApiError)?.code ?? (apiError?.code) ?? 'UNKNOWN_ERROR_CODE';
      const details = (apiError as ApiError)?.details ?? apiError?.details ?? null;
      const requestId = details?.requestId ?? (slotsPayload && (slotsPayload as any)?.requestId) ?? null;

      // 메시지 우선순위: ApiError.message > Error.message > 기본 메시지
      const message = (apiError as ApiError)?.message ?? (apiError as Error)?.message ?? '예산안 확정에 실패했습니다.';

      // 로깅: 서버에서 온 상세 정보와 요청 ID를 함께 남겨 추적 가능하게 함
      try {
        console.error('[reassignSlots] API 호출 실패 상세:', {
          message,
          code: apiCode,
          requestId,
          details,
          accountId,
          // slotsPayload는 크기가 클 수 있어 길이 및 샘플만 기록
          slotsCount: Array.isArray(slotsPayload?.slots) ? slotsPayload.slots.length : undefined,
          sampleSlot: Array.isArray(slotsPayload?.slots) && slotsPayload.slots.length ? slotsPayload.slots[0] : undefined,
        });
      } catch (logErr) {
        console.error('[reassignSlots] 로깅 중 예외 발생:', logErr);
      }

      // 사용자에게는 requestId와 코드가 포함된 친절한 메시지를 던짐
      const userMessage = requestId ? `${message} (요청ID: ${requestId}, 코드: ${apiCode})` : `${message} (코드: ${apiCode})`;
      throw new Error(userMessage);
    }
  }

};
