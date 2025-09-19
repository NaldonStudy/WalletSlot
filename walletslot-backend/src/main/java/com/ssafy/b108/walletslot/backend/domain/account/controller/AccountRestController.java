package com.ssafy.b108.walletslot.backend.domain.account.controller;

import com.ssafy.b108.walletslot.backend.config.security.UserPrincipal;
import com.ssafy.b108.walletslot.backend.domain.account.dto.*;
import com.ssafy.b108.walletslot.backend.domain.account.service.AccountService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Account")
public class AccountRestController {

    // Field
    private final AccountService accountService;

    // Method
    /**
     * 4-1-1 현재 사용자의 모든 계좌목록 조회 (마이데이터 연동)
     */
    @GetMapping
    public ResponseEntity<GetAccountListResponseDto> getAccountList(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.OK).body(accountService.getAccountList(principal.userId()));
    }

    /**
     * 4-1-2 현재 사용자의 연동 계좌목록 조회 (우리 서비스에 연동된 계좌만)
     */
    @GetMapping("/link")
    public ResponseEntity<GetLinkedAccountListResponseDto> getLinkedAccounts(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.OK).body(accountService.getLinkedAccounts(principal.userId()));
    }

    /**
     * 4-1-3 계좌 상세조회
     */
    @GetMapping("/{accountId}")
    public ResponseEntity<GetAccountResponseDto> getAccount(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId) {
        return ResponseEntity.status(HttpStatus.OK).body(accountService.getAccount(principal.userId(), accountId));
    }

    /**
     * 4-1-4 현재 사용자의 대표계좌 상세조회
     */
    @GetMapping("/primary")
    public ResponseEntity<GetPrimaryAccountResponseDto> getPrimaryAccount(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.OK).body(accountService.getPrimaryAccount(principal.userId()));
    }

    /**
     * 4-1-5 계좌 연동 삭제
     */
    @DeleteMapping("/{accountId}")
    public ResponseEntity<DeleteLinkedAccountResponseDto> deleteAccount(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId) {
        return ResponseEntity.status(HttpStatus.OK).body(accountService.deleteLinkedAccount(principal.userId(), accountId));
    }

    /**
     * 4-2-1 1원 송금 요청
     */
    @PostMapping("/verification/request")
    public ResponseEntity<RequestVerificationResponseDto> requestVerification(@AuthenticationPrincipal UserPrincipal principal, @RequestBody RequestVerificationRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.requestVerification(principal.userId(), request.getAccountNo()));
    }

    /**
     * 4-2-2 1원 인증
     */
    @PostMapping("/verification/verify")
    public ResponseEntity<VerifyAccountResponseDto> verifyAccount(@AuthenticationPrincipal UserPrincipal principal, @RequestBody VerifyAccountRequestDto request) {
        int indexOfSpace = request.getAuthIdentifier().indexOf(" ");
        String authText = request.getAuthIdentifier().substring(0, indexOfSpace);
        String authCode = request.getAuthIdentifier().substring(indexOfSpace + 1);

        return ResponseEntity.status(HttpStatus.OK).body(accountService.verifyAccount(principal.userId(), request.getAccountNo(), authText, authCode));
    }

    /**
     * 4-3-1 우리 서비스에 연동할 계좌 등록
     */
    @PostMapping("/link")
    public ResponseEntity<AddAccountResponseDto> addAccount(@AuthenticationPrincipal UserPrincipal principal, @RequestBody AddAccountRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.addAccount(principal.userId(), request.getAccounts()));
    }

    /**
     * 4-3-2 계좌 정보 설정
     */
    @PatchMapping("/{accountId}")
    public ResponseEntity<ModifyAccountResponseDto> modifyAccount(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId, @RequestBody ModifyAccountRequestDto request) {
        return ResponseEntity.status(HttpStatus.OK).body(accountService.modifyAccount(principal.userId(), accountId, request));
    }
}
