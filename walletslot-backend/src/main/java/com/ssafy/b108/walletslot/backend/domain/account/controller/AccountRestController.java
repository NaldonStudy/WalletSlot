package com.ssafy.b108.walletslot.backend.domain.account.controller;

import com.ssafy.b108.walletslot.backend.domain.account.dto.GetLinkedAccountListResponse;
import com.ssafy.b108.walletslot.backend.domain.account.service.AccountService;
import com.ssafy.b108.walletslot.backend.domain.account.dto.GetAccountListResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<GetAccountListResponse> getAccountList() {
        // UserPrincipal에서 userId 추출
        // 지금은 1L로 하드코딩
        GetAccountListResponse getAccountListResponse = accountService.getAccountList(1L);

        return ResponseEntity.status(HttpStatus.OK).body(getAccountListResponse);
    }

    /**
     * 4-1-2 현재 사용자의 연동 계좌목록 조회 (우리 서비스에 연동된 계좌만)
     */
    @GetMapping("/link")
    public ResponseEntity<GetLinkedAccountListResponse> getLinkedAccounts() {
        return ResponseEntity.status(HttpStatus.OK).body(accountService.getLinkedAccounts(1L));
    }


}
