package com.ssafy.b108.walletslot.backend.domain.ai_report.controller;

import com.ssafy.b108.walletslot.backend.config.security.UserPrincipal;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.DeleteAiReportResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.GetAiReportArchiveResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.GetAiReportResponseDto;
import com.ssafy.b108.walletslot.backend.domain.ai_report.dto.ListAiReportMonthsResponseDto;
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

    // ============================= 7-1 생성형 조회 =============================
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
                                                "summary": {
                                                  "totalBudget": 480000,
                                                  "totalSpent": 0,
                                                  "totalOverspent": 0,
                                                  "totalUnderspent": 480000,
                                                  "savedExcludingUnclassified": 480000,
                                                  "oversExcludingUnclassified": 0,
                                                  "top3Slots": [
                                                    {"accountSlotId": "as-uuid-1", "slotName": "식비", "spent": 0, "budget": 150000}
                                                  ]
                                                },
                                                "slots": [
                                                  {
                                                    "accountSlotId": "as-uuid-1",
                                                    "slotId": "slot-uuid-1",
                                                    "slotName": "식비",
                                                    "unclassified": false,
                                                    "budget": 150000,
                                                    "spent": 0,
                                                    "diff": 150000,
                                                    "exceeded": false,
                                                    "overspend": 0,
                                                    "underspend": 150000,
                                                    "baseNext": 150000,
                                                    "allocated": 0,
                                                    "recommendedNextBudget": 150000,
                                                    "deltaFromCurrent": 0
                                                  }
                                                ],
                                                "redistribution": {
                                                  "savedTotal": 480000,
                                                  "oversTotal": 0,
                                                  "shares": [],
                                                  "remainder": 480000
                                                },
                                                "insights": {
                                                  "topMerchants": [],
                                                  "peakDayBySlot": {},
                                                  "notes": ["미분류 제외 절약액을 초과 슬롯에 비율 배분"],
                                                  "aiSummary": null,
                                                  "aiActionItems": []
                                                },
                                                "persist": {"id": "report-uuid", "createdAt": null}
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

    // ============================= 7-2 삭제 =============================
    @DeleteMapping("/{reportId}")
    @Operation(
            summary = "7-2 소비 레포트 삭제",
            description = """
                - Path의 `reportId`는 레포트의 **UUID** 입니다.
                - 소유자/권한 검증은 서비스에서 수행합니다.
                """,
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "2")),
            responses = @ApiResponse(
                    responseCode = "200",
                    description = "성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = DeleteAiReportResponseDto.class),
                            examples = @ExampleObject(
                                    name = "성공 예시",
                                    value = """
                                    {
                                      "success": true,
                                      "message": "[AiReport - 022] 삭제되었습니다.",
                                      "data": { "reportId": "8bfb40a7-4bd0-42e9-9145-ca7c38763b57" }
                                    }
                                    """
                            )
                    )
            )
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

    // ============================= 7-3-1 월 목록 =============================
    @GetMapping("/months")
    @Operation(
            summary = "7-3-1 소비 레포트 보관 월 목록(최근→과거)",
            description = "해당 계좌(UUID)에 저장된 레포트가 존재하는 연-월 목록을 반환합니다. 예: [\"2025-09\",\"2025-08\",...]",
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "0")),
            responses = @ApiResponse(
                    responseCode = "200",
                    description = "성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ListAiReportMonthsResponseDto.class),
                            examples = @ExampleObject(
                                    name = "성공 예시",
                                    value = """
                                    {
                                      "success": true,
                                      "message": "[AiReport - 031] months loaded",
                                      "data": { "yearMonths": ["2025-09","2025-08","2025-07"] }
                                    }
                                    """
                            )
                    )
            )
    )
    public ResponseEntity<ListAiReportMonthsResponseDto> listMonths(
            @AuthenticationPrincipal final UserPrincipal principal,
            @Parameter(description = "계좌 UUID (값은 UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable(name = "accountId") final String accountId
    ) {
        return ResponseEntity.ok(service.listMonths(principal.userId(), accountId));
    }

    // ============================= 7-3-2 월별 아카이브 =============================
    @GetMapping("/archive")
    @Operation(
            summary = "7-3-2 소비 레포트 월별 아카이브 조회",
            description = """
                - yearMonth(YYYY-MM)로 특정 월을 직접 조회하거나, 없으면 offset으로 이동합니다.
                - offset: 0=가장 최신 월, 1=이전 월, 2=그 이전 ...
                - 응답의 prevYearMonth/nextYearMonth로 좌/우 화살표 네비게이션 구현이 쉽습니다.
                - 같은 달에 여러 개면 reports는 created_at 내림차순(최신→과거)입니다.
                - reports의 각 아이템은 7-1 응답과 동일 구조(period/summary/slots/redistribution/insights/persist)입니다.
                """,
            extensions = @Extension(name = "x-order", properties = @ExtensionProperty(name = "order", value = "0.5")),
            responses = @ApiResponse(
                    responseCode = "200",
                    description = "성공",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = GetAiReportArchiveResponseDto.class),
                            examples = @ExampleObject(
                                    name = "성공 예시",
                                    value = """
                                    {
                                      "success": true,
                                      "message": "[AiReport - 034] archive loaded",
                                      "data": {
                                        "yearMonth": "2025-09",
                                        "prevYearMonth": "2025-08",
                                        "nextYearMonth": null,
                                        "yearMonths": ["2025-09","2025-08","2025-07"],
                                        "reports": [
                                          {
                                            "reportId": "f3b8a8a0-1c8e-4c78-9d71-2e8b2e0a7f9a",
                                            "createdAt": "2025-09-26T15:03:22",
                                            "period": {
                                              "yearMonth": null,
                                              "startAt": "2025-09-01 00:00:00",
                                              "endAt": "2025-09-30 23:59:59"
                                            },
                                            "summary": {
                                              "totalBudget": 520000,
                                              "totalSpent": 460000,
                                              "totalOverspent": 10000,
                                              "totalUnderspent": 70000,
                                              "savedExcludingUnclassified": 70000,
                                              "oversExcludingUnclassified": 10000,
                                              "top3Slots": [
                                                {"accountSlotId":"as-uuid-1","slotName":"식비","spent":210000,"budget":200000},
                                                {"accountSlotId":"as-uuid-2","slotName":"교통","spent":80000,"budget":90000},
                                                {"accountSlotId":"as-uuid-3","slotName":"생활","spent":60000,"budget":60000}
                                              ]
                                            },
                                            "slots": [
                                              {
                                                "accountSlotId":"as-uuid-1",
                                                "slotId":"slot-uuid-1",
                                                "slotName":"식비",
                                                "unclassified":false,
                                                "budget":200000,
                                                "spent":210000,
                                                "diff":-10000,
                                                "exceeded":true,
                                                "overspend":10000,
                                                "underspend":0,
                                                "baseNext":200000,
                                                "allocated":0,
                                                "recommendedNextBudget":200000,
                                                "deltaFromCurrent":0
                                              }
                                            ],
                                            "redistribution": {
                                              "savedTotal": 70000,
                                              "oversTotal": 10000,
                                              "shares": [
                                                {"accountSlotId":"as-uuid-1","slotName":"식비","ratio":1.0,"allocated":10000}
                                              ],
                                              "remainder": 60000
                                            },
                                            "insights": {
                                              "topMerchants": [{"name":"CU","amount":45000,"count":0}],
                                              "peakDayBySlot": {"as-uuid-1":{"dayOfWeek":6,"amount":90000}},
                                              "notes": ["미분류 제외 절약액을 초과 슬롯에 비율 배분"],
                                              "aiSummary": "식비 초과가 발생했습니다. 남은 절약액으로 보전 가능합니다.",
                                              "aiActionItems": ["식비 예산 상향 검토","주말 지출 패턴 관리"]
                                            },
                                            "persist": {"id":"f3b8a8a0-1c8e-4c78-9d71-2e8b2e0a7f9a","createdAt":"2025-09-26T15:03:22"}
                                          }
                                        ]
                                      }
                                    }
                                    """
                            )
                    )
            )
    )
    public ResponseEntity<GetAiReportArchiveResponseDto> getArchive(
            @AuthenticationPrincipal final UserPrincipal principal,
            @Parameter(description = "계좌 UUID (값은 UUID)", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable(name = "accountId") final String accountId,
            @Parameter(description = "조회 월(YYYY-MM). 없으면 offset 사용", example = "2025-09")
            @RequestParam(name = "yearMonth", required = false) String yearMonth,
            @Parameter(description = "0=가장 최신월, 1=이전월 ... (기본 0)", example = "0")
            @RequestParam(name = "offset", required = false, defaultValue = "0") Integer offset
    ) {
        return ResponseEntity.ok(
                service.getArchiveByMonthOrOffset(principal.userId(), accountId, yearMonth, offset)
        );
    }
}
