package com.ssafy.b108.walletslot.backend.domain.slot.service;

import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.account.repository.AccountRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.*;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.AccountSlot;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.Slot;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.AccountSlotRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.SlotHistoryRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.SlotRepository;
import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import com.ssafy.b108.walletslot.backend.domain.user.repository.UserRepository;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class SlotService {

    // Field
    private final SlotRepository slotRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountSlotRepository accountSlotRepository;
    private final SlotHistoryRepository slotHistoryRepository;

    // Method
    // 5-1-1
    public GetSlotListResponseDto getSlotList() {

        // slot 리스트 전부 조회해오기
        List<Slot> slotList = slotRepository.findAll();

        // dto 조립
        // dto > data > slots
        List<GetSlotListResponseDto.SlotDto> slotDtoList = new ArrayList<>();
        for(Slot slot : slotList){
            GetSlotListResponseDto.SlotDto slotDto = GetSlotListResponseDto.SlotDto.builder()
                    .SlotId(slot.getUuid())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .color(slot.getColor())
                    .icon(slot.getIcon())
                    .rank(slot.getRank())
                    .build();

            slotDtoList.add(slotDto);
        }

        // dto
        GetSlotListResponseDto getSlotListResponseDto = GetSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 000] 슬롯 전체조회 성공")
                .data(GetSlotListResponseDto.Data.builder().slots(slotDtoList).build())
                .build();

        // 응답
        return getSlotListResponseDto;
    }

    // 5-1-4
    public GetAccountSlotListResponseDto getAccountSlotList(Long userId, String accountUuid) {

        // userId != 조회한 account userId 이면 403
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "[SlotService - 000]");
        }

        // AccountSlot 전체조회
        List<AccountSlot> accountSlotList = accountSlotRepository.findByAccount(account).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));

        // dto 조립
        // dto > data > slots
        List<GetAccountSlotListResponseDto.SlotDto> slotDtoList = new ArrayList<>();
        for(AccountSlot accountSlot : accountSlotList){

            // 기본 슬롯정보 담기 위해 slot 객체 얻기
            Slot slot = accountSlot.getSlot();

            GetAccountSlotListResponseDto.SlotDto slotDto = GetAccountSlotListResponseDto.SlotDto.builder()
                    .slotId(slot.getUuid())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .icon(slot.getIcon())
                    .color(slot.getColor())
                    .accountSlotId(accountSlot.getUuid())
                    .isCustom(accountSlot.isCustom())
                    .customName(accountSlot.getCustomName())
                    .initialBudget(accountSlot.getInitialBudget())
                    .currentBudget(accountSlot.getCurrentBudget())
                    .spent(accountSlot.getSpent())
                    .remainingBudget(accountSlot.getCurrentBudget() - accountSlot.getSpent())
                    .isBudgetExceeded(accountSlot.isBudgetExceeded())
                    .exceededBudget(accountSlot.getSpent() - accountSlot.getCurrentBudget())
                    .budgetChangeCount(accountSlot.getBudgetChangeCount())
                    .build();

            slotDtoList.add(slotDto);
        }

        // dto 조립
        GetAccountSlotListResponseDto getAccountSlotListResponseDto = GetAccountSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 000] 계좌의 슬롯 리스트 조회 성공")
                .data(GetAccountSlotListResponseDto.Data.builder().slots(slotDtoList).build())
                .build();

        // 응답
        return getAccountSlotListResponseDto;
    }

    // 5-2-2
    public AddSlotListResponseDto addSlotList(Long userId, String accountUuid, List<AddSlotListRequestDto.SlotDto> slotDtoList) {

        // user 조회 (없으면 404)
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));

        // account 조회 (없으면 404)
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));

        // userId != 요청한 계좌 userId 이면 403
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "[SlotService - 000]");
        }

        // 슬롯 중복검사하기 위해서 미리 이 계좌에 등록돼있는 슬롯 UUID Set 만들어두기
        List<AccountSlot> accountSlotList = account.getAccountSlots();
        Set<String> slotUuidList = new HashSet<>();
        for(AccountSlot accountSlot : accountSlotList){
           slotUuidList.add(accountSlot.getSlot().getUuid());
        }

        // accountSlotList.size() == 0 이면 최초 슬롯등록 / > 0 이면 슬롯추가
        boolean isInitial = true;

        // 등록하려는 슬롯들의 initialBudget 총합과 비교해야하는 값
        // 최초라면 그대로 두고, 최초가 아니라면 아래 로직에 의해 바뀜
        Long budgetLimit = account.getBalance();

        if(!slotDtoList.isEmpty()){
            isInitial = false;

            Long nonExceededSlotsRemainingSum = null;
            for(AccountSlot accountSlot : accountSlotList) {
                if(!accountSlot.isBudgetExceeded()) {
                    nonExceededSlotsRemainingSum += (accountSlot.getCurrentBudget() - accountSlot.getSpent());
                }
            }

            budgetLimit -= nonExceededSlotsRemainingSum;
        }

        // 등록하려는 슬롯들의 initialBudget 총합을 저장할 변수
        Long initialBudgetSum = null;

        // slotDto 돌면서 존재 안하는 slot 있으면 404
        // 응답할 때 쓸 SlotDtoList 미리 만들어두기
        List<AddSlotListResponseDto.SlotDto> slotDtoList2 = new ArrayList<>();
        for(AddSlotListRequestDto.SlotDto slotDto : slotDtoList){

            // 이미 있는 slot 추가하려고 할때 409 (위에서 만들어둔 slotUuidList 활용)
            if(slotUuidList.contains(slotDto.getSlotId())) {
                throw new AppException(ErrorCode.CONFLICT, "[SlotService - 000]");
            }

            // initialBudgetSum에 누적합
            initialBudgetSum += slotDto.getInitialBudget();

            // slot 조회 (없으면 404)
            Slot slot = slotRepository.findByUuid(slotDto.getSlotId()).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));

            // AccountSlot 객체 만들기
            AccountSlot accountSlot = AccountSlot.builder()
                    .account(account)
                    .slot(slot)
                    .isCustom(slotDto.isCustom())
                    .customName(slotDto.getCustomName())
                    .initialBudget(slotDto.getInitialBudget())
                    .build();

            // DB에 저장
            accountSlotRepository.save(accountSlot);

            // dto 조립
            // dto > data > slots
            AddSlotListResponseDto.SlotDto slotDto2 = AddSlotListResponseDto.SlotDto.builder()
                    .accountSlotId(accountSlot.getUuid())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .isCustom(slotDto.isCustom())
                    .customName(slotDto.getCustomName())
                    .initialBudget(slotDto.getInitialBudget())
                    .build();

            slotDtoList2.add(slotDto2);
        } // 추가요청받은 슬롯 리스트 추가 완료

        // initialBudgetSum <= budgetLimit 검사
        if(initialBudgetSum >  budgetLimit) {
            throw new AppException(ErrorCode.ALLOCATABLE_BUDGET_EXCEEDED, "[SlotService - 000]");
        }

        // dto 조립
        AddSlotListResponseDto addSlotListResponseDto = AddSlotListResponseDto.builder()
                .success(true)
                .message("[SlotService - 000] 슬롯 추가 성공")
                .data(AddSlotListResponseDto.Data.builder().slots(slotDtoList2).build())
                .build();

        // 응답
        return addSlotListResponseDto;
    }

    // 5-2-3
    public ModifyAccountSlotResponseDto modifyAccountSlot(Long userId, String accountUuid, List<ModifyAccountSlotRequestDto.SlotDto> slotDtoList) {

        // userId != account userId이면 403
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "[SlotService - 000]");
        }

        // 이 account 기준으로 accountSlot 조회해서 isExceeded == false 인거 있으면 절약금액 총합 누적
        List<AccountSlot> accountSlotList = account.getAccountSlots();
        Long savingAmount = 0L;
        for(AccountSlot accountSlot : accountSlotList){

            // 기존 SlotHistory 전부 삭제 (for문 도는 김에 이 안에서 삭제)
            slotHistoryRepository.deleteByAccountSlot(accountSlot);

            // 예산을 절약해서 사용한 슬롯이 있다면 절약 금액에 누적합
            if(!accountSlot.isBudgetExceeded()) {
                savingAmount += (accountSlot.getInitialBudget() - accountSlot.getSpent());
            }
        }

        // 기존 AccountSlot들 전부 삭제 (만약 기준에 부합하지 않아서 메서드가 끝나기 전에 예외가 터지면, 롤백될 것이므로 괜찮음)
        accountSlotRepository.deleteByAccount(account);

        // slotDtoList 돌면서 이전에도 있던 슬롯이면(slotId 받은거 기준으로 조회) initialBudget 기준으로 예산 늘리는 건지 계산
        // 늘리는 거면 늘린 예산 총합에 누적
        Long additionalBudget = 0L;

        // 응답 dto에 들어갈 SlotDto 리스트
        List<ModifyAccountSlotResponseDto.SlotDto> slotDtoList2 = new ArrayList<>();

        for(ModifyAccountSlotRequestDto.SlotDto slotDto : slotDtoList){

            // 기존에 있던 슬롯인지 검사
            for(AccountSlot accountSlot : accountSlotList) {
                if(accountSlot.getSlot().getUuid().equals(slotDto.getSlotId())) {

                    // 있던 슬롯이면 예산을 줄이는건지 늘리는 건지 검사
                    if(slotDto.getInitialBudget() > accountSlot.getInitialBudget()) {

                        // 늘리는 거면 addtionalBudget에 누적합
                        additionalBudget += (slotDto.getInitialBudget() - accountSlot.getInitialBudget());
                    }
                    // 기존에 있던 슬롯의 예산을 줄이는 경우는 고려하지 않음.
                    // 예산을 줄일 슬롯이 지난달에 절약한 슬롯과 겹칠 경우, 둘 중 하나만 반영해야 하는데 그러면 사용자가 헷갈릴 것 같아서 고려하지 X
                    // 무조건 지난달에 절약한 만큼만 늘릴 수 있도록.
                }
            }

            // AccountSlot 객체 만들어서 save.
            // AccountSlot 객체에 넣을 Slot 객체 먼저 조회
            Slot slot = slotRepository.findByUuid(slotDto.getSlotId()).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[SlotService - 000]"));

            // AccountSlot 객체 만들기
            AccountSlot accountSlot = AccountSlot.builder()
                    .account(account)
                    .slot(slot)
                    .initialBudget(slotDto.getInitialBudget())
                    .isCustom(slotDto.isCustom())
                    .customName(slotDto.getCustomName())
                    .build();

            // 저장
            accountSlotRepository.save(accountSlot);

            // 응답 dto 조립
            // dto > data > slots
            ModifyAccountSlotResponseDto.SlotDto slotDto2 = ModifyAccountSlotResponseDto.SlotDto.builder()
                    .accountSlotId(accountSlot.getUuid())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .isCustom(slotDto.isCustom())
                    .customName(slotDto.getCustomName())
                    .initialBudget(slotDto.getInitialBudget())
                    .build();

            slotDtoList2.add(slotDto2);
        } // 요청받은 슬롯들에 대해 전부 돌면서 저장 완료

        // 마지막에 절약금액 >= 늘린예산 인지 검사 (아니면 THRIFT_BUDGET_EXCEEDED 발생 시키기)
        if(savingAmount < additionalBudget) {
            throw new AppException(ErrorCode.THRIFT_BUDGET_EXCEEDED, "[SlotService - 000]");
        }

        // dto 조립
        ModifyAccountSlotResponseDto modifyAccountSlotResponseDto = ModifyAccountSlotResponseDto.builder()
                .success(true)
                .message("[SlotService - 000] 다음달 슬롯 리스트 등록 성공")
                .data(ModifyAccountSlotResponseDto.Data.builder().slots(slotDtoList2).build())
                .build();

        // 응답
        return modifyAccountSlotResponseDto;
    }
}
