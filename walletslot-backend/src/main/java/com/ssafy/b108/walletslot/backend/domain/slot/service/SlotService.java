package com.ssafy.b108.walletslot.backend.domain.slot.service;

import com.ssafy.b108.walletslot.backend.domain.account.dto.AddAccountRequestDto;
import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.account.repository.AccountRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.AddSlotListDto;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.AddSlotListRequestDto;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.AddSlotListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.GetAccountSlotListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.slot.dto.GetSlotListResponseDto;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.AccountSlot;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.Slot;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.AccountSlotRepository;
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

}
