package com.ssafy.b108.walletslot.backend.domain.transaction.controller;

import com.ssafy.b108.walletslot.backend.config.security.UserPrincipal;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.GetSlotListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.GetAccountSlotTransactionListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.GetAccountTransactionListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.SplitTransactionResponseDto;
import com.ssafy.b108.walletslot.backend.domain.transaction.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Transaction")
/**
 * Transaction REST API Controller 입니다.
 * 거래내역을 다루는 성격의 메서드들을 TransactionController에서 작성하였습니다.
 * 거래내역을 슬롯에 배정해서 지출금액을 차감하는 우리 서비스 특성 상, TransactionController에 있는 메서드이더라도 대부분의 매핑 경로가 /accounts로 시작합니다.
 */
public class TransactionController {

    // Field
    private final TransactionService transactionService;

    // Method
    @GetMapping("/accounts/{accountId}/transactions")
    @Operation(
            summary = "6-1-1 계좌 거래내역 전체조회",
            description = "계좌의 거래내역을 전체 조회합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "[SlotService - 001] 계좌 거래내역 전체조회 성공",
                            content = @Content(schema = @Schema(implementation = GetSlotListResponseDto.class))
                    )
            }

    )
    public ResponseEntity<GetAccountTransactionListResponseDto> getAccountTransactionList(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId) {
        return ResponseEntity.status(HttpStatus.OK).body(transactionService.getAccountTransactionList(principal.userId(), accountId));
    }

    @GetMapping("/accounts/{accountId}/slots/{accountSlotId}/transactions")
    @Operation(
            summary = "6-1-2 슬롯 거래내역 전체조회",
            description = "슬롯의 거래내역을 전체 조회합니다.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "[SlotService - 001] 슬롯 거래내역 전체조회 성공",
                            content = @Content(schema = @Schema(implementation = GetSlotListResponseDto.class))
                    )
            }

    )
    public ResponseEntity<GetAccountSlotTransactionListResponseDto> getAccountSlotTransactionList(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId, @PathVariable String accountSlotId) {
        return ResponseEntity.status(HttpStatus.OK).body(transactionService.getAccountSlotTransactionList(principal.userId(), accountId, accountSlotId));
    }

    @PostMapping("/accounts/{accountId}/transactions/{transactionId}/split")
    @Operation(
            summary = "6-2-1 거래내역 나누기",
            description = "하나의 거래내역을 여러개의 거래내역으로 나눕니다. (거래내역 분할 및 더치페이 기능에 활용)",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "[SlotService - 001] 슬롯 거래내역 나누기 성공 (이어서 6-2-2 요청을 보내주시기 바랍니다.)",
                            content = @Content(schema = @Schema(implementation = GetSlotListResponseDto.class))
                    )
            }

    )
    public ResponseEntity<SplitTransactionResponseDto> splitTransaction(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId, @PathVariable String transactionId) {
        return ResponseEntity.status(HttpStatus.OK).body(transactionService.splitTransaction(principal.userId(), accountId, transactionId));
    }
}
