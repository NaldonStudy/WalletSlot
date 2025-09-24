package com.ssafy.b108.walletslot.backend.domain.ai_report.controller;

import com.ssafy.b108.walletslot.backend.config.security.UserPrincipal;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.DeleteAiReportResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.GetAiReportResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.service.AiReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/accounts/{accountId}/ai-reports") // accountId(=UUID)
@RequiredArgsConstructor
@Tag(name = "AI Report")
public class AiReportController {

    private final AiReportService service;

    @GetMapping
    @Operation(
            summary = "7-1 소비 레포트 조회 (임의 기간 + AI 개인화 인사이트)",
            description = """
                프론트 가이드:
                - Path의 `accountId`는 **계좌 UUID** 입니다. (값은 UUID, 이름만 id)
                - 조회 기간: `start`~`end` **둘 다 포함(inclusive)**.
                - 날짜 형식: `yyyy-MM-dd` (예: 2025-08-01). 서버는 내부적으로 `00:00:00`~`23:59:59`로 확장 집계.
                - 분배 규칙: **미분류(PK=0)는 분배 제외**. 절약(savings)→초과(overs) 슬롯 비례 배분, 천원 단위 내림 후 잔여는 라운드로빈.
                - persist=true: 생성 결과 저장. 응답의 `persist.id`는 **UUID**.
                - 주요 필드:
                  · `summary.*` 전체 합계
                  · `slots[]` 슬롯별 실적 및 다음기간 추천(천원 단위)
                  · `redistribution.*` 절약→초과 비례 배분 결과
                  · `insights.*` 간단 통계 + AI 제안
                """,
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "1")),
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "성공",
                            content = @Content(
                                    mediaType = "application/json",
                                    schema = @Schema(implementation = GetAiReportResponseDto.class),
                                    examples = @ExampleObject(
                                            name = "성공 예시",
                                            value = """
                                            {
                                              "success": true,
                                              "message": "[AiReport - 015] OK",
                                              "data": {
                                                "period": {"yearMonth": null, "startAt": "2025-08-01 00:00:00", "endAt": "2025-08-31 23:59:59"},
                                                "summary": {"totalBudget":480000,"totalSpent":0,"totalOverspent":0,"totalUnderspent":480000,"savedExcludingUnclassified":480000,"oversExcludingUnclassified":0,"top3Slots":[{"accountSlotId":"...uuid...","slotName":"식비","spent":0,"budget":150000}]},
                                                "slots": [{"accountSlotId":"...uuid...","slotId":"...uuid...","slotName":"식비","unclassified":false,"budget":150000,"spent":0,"diff":150000,"exceeded":false,"overspend":0,"underspend":150000,"baseNext":150000,"allocated":0,"recommendedNextBudget":150000,"deltaFromCurrent":0}],
                                                "redistribution": {"savedTotal":480000,"oversTotal":0,"shares":[],"remainder":480000},
                                                "insights": {"topMerchants":[],"peakDayBySlot":{},"notes":["미분류 제외 절약액을 초과 슬롯에 비율 배분"],"aiSummary":null,"aiActionItems":[]},
                                                "persist": {"id":"...uuid...","createdAt":null}
                                              }
                                            }
                                            """
                                    )
                            )
                    )
            }
    )
    public ResponseEntity<GetAiReportResponseDto> getReport(
            @AuthenticationPrincipal final UserPrincipal principal,
            @Parameter(description = "계좌 UUID (값은 UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable(name = "accountId") final String accountId,
            @Parameter(description = "시작일(yyyy-MM-dd). 당일 00:00:00부터 집계", example = "2025-08-01")
            @RequestParam(name = "start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            final LocalDate startDate,
            @Parameter(description = "종료일(yyyy-MM-dd). 당일 23:59:59까지 집계", example = "2025-08-31")
            @RequestParam(name = "end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            final LocalDate endDate,
            @Parameter(description = "레포트를 DB에 저장할지 여부 (기본 true). 저장 시 persist.id는 UUID", example = "true")
            @RequestParam(name = "persist", required = false, defaultValue = "true")
            final boolean persist
    ) {
        return ResponseEntity.ok(
                service.getReportByPeriod(principal.userId(), accountId, startDate, endDate, persist)
        );
    }

    @DeleteMapping("/{reportId}")
    @Operation(
            summary = "7-2 소비 레포트 삭제",
            description = """
                - Path의 `reportId`는 레포트의 **UUID** 입니다.
                - 소유자/권한 검증은 서비스에서 수행합니다.
                """,
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "2"))
    )
    public ResponseEntity<DeleteAiReportResponseDto> deleteReport(
            @AuthenticationPrincipal final UserPrincipal principal,
            @Parameter(description = "계좌 UUID (값은 UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable(name = "accountId") final String accountId,
            @Parameter(description = "레포트 UUID", example = "8bfb40a7-4bd0-42e9-9145-ca7c38763b57")
            @PathVariable final String reportId
    ) {
        return ResponseEntity.ok(service.delete(principal.userId(), accountId, reportId));
    }
}
