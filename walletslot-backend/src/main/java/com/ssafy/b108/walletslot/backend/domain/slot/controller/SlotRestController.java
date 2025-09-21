package com.ssafy.b108.walletslot.backend.domain.slot.controller;

import com.ssafy.b108.walletslot.backend.config.security.UserPrincipal;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.*;
import com.ssafy.b108.walletslot.backend.domain.slot.service.SlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Slot")
/**
 * Slot REST API Controller 입니다.
 * 슬롯을 다루는 성격의 메서드들을 SlotController에서 작성하였습니다.
 * Account - Slot 간 연결관계가 강한 우리 서비스 특성 상, SlotController에 있는 메서드이더라도 대부분의 매핑 경로가 /accounts로 시작합니다.
 */
public class SlotRestController {

    // Field
    private final SlotService slotService;

    // Method
    @GetMapping("/slots")
    @Operation(
            summary = "5-1-1 슬롯 전체조회",
            description = "사용자에게 제공할 슬롯의 종류를 전체조회합니다."
    )
    public ResponseEntity<GetSlotListResponseDto> getSlotList() {
        return ResponseEntity.status(HttpStatus.OK).body(slotService.getSlotList());
    }

    @PatchMapping("/accounts/{accountId}/slots/{slotId}")
    @Operation(
            summary = "5-1-2 슬롯 정보수정",
            description = "슬롯에 별칭을 지정하거나 예산을 변경합니다. 별칭은 추후 같은 API에 customName 키 값을 default로 해서 요청을 보내시면 기본값으로 되돌아갑니다."
    )
    public ResponseEntity<ModifyAccountSlotResponseDto> modifyAccountSlot(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId, @PathVariable String slotId, @RequestBody ModifyAccountSlotRequestDto request) {
        return ResponseEntity.status(HttpStatus.OK).body(slotService.modifyAccountSlot(principal.userId(), accountId, slotId, request));
    }

    @DeleteMapping("/accounts/{accountId}/slots/{slotId}")
    @Operation(
            summary = "5-1-3 슬롯 삭제",
            description = "슬롯을 삭제합니다."
    )
    public ResponseEntity<RemoveAccountSlotResponseDto> removeAccountSlot(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId, @PathVariable String slotId) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(slotService.removeAccountSlot(principal.userId(), accountId, slotId));
    }

    @GetMapping("/accounts/{accountId}/slots")
    @Operation(
            summary = "5-1-4 계좌 슬롯 리스트 전체 조회",
            description = "계좌의 슬롯 리스트를 전체 조회합니다."
    )
    public ResponseEntity<GetAccountSlotListResponseDto> getAccountSlotList(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId) {
        return ResponseEntity.status(HttpStatus.OK).body(slotService.getAccountSlotList(principal.userId(), accountId));
    }

    @PostMapping("accounts/{accountId}/slots/recommend")
    @Operation(
            summary = "5-2-1 계좌 슬롯 리스트 추천",
            description = "계좌 연동 후 슬롯 리스트를 추천합니다."
    )
    public ResponseEntity<RecommendSlotListResponseDto> recommendSlotList(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId, @RequestBody RecommendSlotListRequestDto request) {
        return ResponseEntity.status(HttpStatus.OK).body(slotService.recommendSlotList(principal.userId(), accountId, request.getBaseDay(), request.getIncome(), request.getPeriod()));
    }

    @GetMapping("/api/accounts/{accountId}/slots/{slotId}/history")
    public ResponseEntity<GetSlotHistoryResponseDto> getSlotHistory(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId, @PathVariable String slotId) {
        return ResponseEntity.status(HttpStatus.OK).body(slotService.getSlotHistory(principal.userId(), accountId, slotId));
    }


    @PostMapping("/{accountId}/slots")
    @Operation(
            summary = "5-2-2 슬롯등록"  ,
            description = "계좌의 슬롯 리스트를 최초로 등록하거나 추후 서비스 이용 중 새로운 슬롯을 추가로 등록합니다."
    )
    public ResponseEntity<AddSlotListResponseDto> addSlotList(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId, @RequestBody AddSlotListRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(slotService.addSlotList(principal.userId(), accountId, request.getSlots()));
    }

    @PatchMapping("/accounts/{accountId}/slots/reassign")
    @Operation(
            summary = "5-2-3 슬롯재편성"  ,
            description = "기준일이 도래하여 계좌의 슬롯 리스트를 재편성합니다."
    )
    public ResponseEntity<ModifyAccountSlotListResponseDto> modifyAccountSlotListResponseDto(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String accountId, @RequestBody ModifyAccountSlotListRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(slotService.modifyAccountSlotList(principal.userId(), accountId, request.getSlots()));
    }
}
