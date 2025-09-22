package com.ssafy.b108.walletslot.backend.domain.transaction.service;

import com.ssafy.b108.walletslot.backend.domain.account.entity.Account;
import com.ssafy.b108.walletslot.backend.domain.account.repository.AccountRepository;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.AccountSlot;
import com.ssafy.b108.walletslot.backend.domain.slot.entity.Slot;
import com.ssafy.b108.walletslot.backend.domain.slot.repository.AccountSlotRepository;
import com.ssafy.b108.walletslot.backend.domain.transaction.dto.*;
import com.ssafy.b108.walletslot.backend.domain.transaction.entity.Transaction;
import com.ssafy.b108.walletslot.backend.domain.transaction.repository.TransactionRepository;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    // Field
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AccountSlotRepository accountSlotRepository;

    // Method
    /**
     * 6-1-1 계좌 거래내역 전체조회
     */
    public GetAccountTransactionListResponseDto getAccountTransactions(Long userId, String accountUuid) {

        // userId != account userId 이면 403
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 001"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "TransactionService - 002");
        }

        // dto > data > transactions
        List<Transaction> transactionList = transactionRepository.findByAccount(account);
        List<GetAccountTransactionListResponseDto.TransactionDto> transactionDtoList = new ArrayList<>();
        for(Transaction transaction : transactionList) {

            GetAccountTransactionListResponseDto.TransactionDto transactionDto = GetAccountTransactionListResponseDto.TransactionDto.builder()
                    .transactionId(transaction.getUuid())
                    .type(transaction.getType())
                    .opponentAccountNo(transaction.getOpponentAccountNo())
                    .summary(transaction.getSummary())
                    .amount(transaction.getAmount())
                    .balance(transaction.getBalance())
                    .transactionAt(transaction.getTransactionAt())
                    .build();

            transactionDtoList.add(transactionDto);
        }

        // dto
        GetAccountTransactionListResponseDto getAccountTransactionListResponseDto = GetAccountTransactionListResponseDto.builder()
                .success(true)
                .message("[TransactionService - 000] 계좌 거래내역 전체조회 성공")
                .data(GetAccountTransactionListResponseDto.Data.builder().transactions(transactionDtoList).build())
                .build();

        // 응답
        return getAccountTransactionListResponseDto;
    }

    /**
     * 6-1-2 슬롯 거래내역 전체조회
     */
    public GetAccountSlotTransactionListResponseDto getAccountSlotTransactions(Long userId, String accountUuid, String accountSlotUuid) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 001"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "TransactionService - 002");
        }

        // account != account slot의 account 이면 400 응답
        AccountSlot accountSlot = accountSlotRepository.findByUuid(accountSlotUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 001"));
        if(!account.getUuid().equals(accountSlot.getAccount().getUuid())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "TransactionService - 003");
        }

        // 슬롯 거래내역 전체조회
        // dto > data > transactions
        List<Transaction> transactionList =  transactionRepository.findByAccountSlot(accountSlot);
        List<GetAccountSlotTransactionListResponseDto.TransactionDto> transactionDtoList = new ArrayList<>();
        for(Transaction transaction : transactionList) {

            GetAccountSlotTransactionListResponseDto.TransactionDto transactionDto = GetAccountSlotTransactionListResponseDto.TransactionDto.builder()
                    .transactionId(transaction.getUuid())
                    .type(transaction.getType())
                    .opponentAccountNo(transaction.getOpponentAccountNo())
                    .summary(transaction.getSummary())
                    .amount(transaction.getAmount())
                    .balance(transaction.getBalance())
                    .transactionAt(transaction.getTransactionAt())
                    .build();

            transactionDtoList.add(transactionDto);
        }

        // dto
        GetAccountSlotTransactionListResponseDto getAccountSlotTransactionListResponseDto = GetAccountSlotTransactionListResponseDto.builder()
                .success(true)
                .message("[TransactionService - 000] 슬롯 거래내역 전체조회 성공")
                .data(GetAccountSlotTransactionListResponseDto.Data.builder().transactions(transactionDtoList).build())
                .build();

        // 응답
        return getAccountSlotTransactionListResponseDto;
    }

    /**
     * 6-2-1 거래내역 나누기
     */
    public AddSplitTransactionsResponseDto addSplitTransactions(Long userId, String accountUuid, String transactionUuid, List<AddSplitTransactionsRequestDto.SplitTransactionDto> splitTransactions) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 001"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "TransactionService - 002");
        }

        // transaction 조회
        Transaction originalTransaction = transactionRepository.findByUuid(transactionUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 001"));

        // originalTransaction 삭제
        transactionRepository.delete(originalTransaction);

        // originalTransaction이 속해있던 account slot의 지출금액 회복시키기
        // account slot 조회 후 지출금액 등 값 조정
        AccountSlot originalTransactionAccountSlot = originalTransaction.getAccountSlot();
        originalTransactionAccountSlot.updateSpent(originalTransactionAccountSlot.getSpent() - originalTransaction.getAmount());
        if(originalTransactionAccountSlot.getCurrentBudget() >= originalTransactionAccountSlot.getSpent()) {
            originalTransactionAccountSlot.updateIsBudgetExceeded(false);
        } else {
            originalTransactionAccountSlot.updateIsBudgetExceeded(true);
        }

        // splitTransactions 돌면서 각각 Transaction 객체 만들어서 save.
        // 나머지 필드들은 origin 트랜잭션에서 가져오면 됨
        Long splitAmountSum = 0L;    // 나눈 금액들의 여태까지의 누적합을 저장할 변수
        List<AddSplitTransactionsResponseDto.SplitTransactionDto> splitTransactionDtos = new ArrayList<>();
        for(int i=0; i<splitTransactions.size(); i++) {

            // 이번 차례 SplitTransactionDto의 금액을 누적합해놓기
            AddSplitTransactionsRequestDto.SplitTransactionDto splitTransactionDto = splitTransactions.get(i);
            splitAmountSum += splitTransactionDto.getAmount();

            // AccountSlot 조회
            AccountSlot accountSlot = accountSlotRepository.findByUuid(splitTransactionDto.getAccountSlotId()).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 001"));
            Slot slot = accountSlot.getSlot();  // 나눌 슬롯 정보도 줘야하니깐 Slot 객체 얻어놓기

            // Transaction 객체 만들기
            Transaction transaction = Transaction.builder()
                    .account(originalTransaction.getAccount())
                    .accountSlot(accountSlot)
                    .uniqueNo(originalTransaction.getUniqueNo())
                    .type(originalTransaction.getType())
                    .opponentAccountNo(originalTransaction.getOpponentAccountNo())
                    .summary(originalTransaction.getSummary())
                    .amount(splitTransactionDto.getAmount())
                    .balance(originalTransaction.getBalance()+(originalTransaction.getAmount()-splitAmountSum))
                    .transactionAt(originalTransaction.getTransactionAt())
                    .build();

            // 저장
            transactionRepository.save(transaction);

            // dto > data > splitTransactions > slot
            // 예산초과 상태 아닐 때를 대비하여, exceededBudget값만 미리 계산
            Long exceededBudget = accountSlot.getSpent() - accountSlot.getCurrentBudget();
            if(exceededBudget < 0) {
                exceededBudget = 0L;
            }

            AddSplitTransactionsResponseDto.SlotDto slotDto = AddSplitTransactionsResponseDto.SlotDto.builder()
                    .accountSlotId(splitTransactionDto.getAccountSlotId())
                    .name(slot.getName())
                    .isSaving(slot.isSaving())
                    .icon(slot.getIcon())
                    .color(slot.getColor())
                    .isCustom(accountSlot.isCustom())
                    .customName(accountSlot.getCustomName())
                    .currentBudget(accountSlot.getCurrentBudget())
                    .spent(accountSlot.getSpent())
                    .remainingBudget(accountSlot.getCurrentBudget() - accountSlot.getSpent())
                    .isBudgetExceeded(accountSlot.isBudgetExceeded())
                    .exceededBudget(exceededBudget)
                    .build();

            // dto > data > splitTransactions > transaction
            AddSplitTransactionsResponseDto.TransactionDto transactionDto2 = AddSplitTransactionsResponseDto.TransactionDto.builder()
                    .transactionId(transaction.getUuid())
                    .amount(splitTransactionDto.getAmount())
                    .build();

            // dto > data > splitTransactions
            AddSplitTransactionsResponseDto.SplitTransactionDto splitTransactionDto2 = AddSplitTransactionsResponseDto.SplitTransactionDto.builder()
                    .slot(slotDto)
                    .transaction(transactionDto2)
                    .build();

            splitTransactionDtos.add(splitTransactionDto2);
        }

        // 마지막에 나눈 금액들의 합 == 원래 금액인지 검사하고, 같지 않으면 400 응답
        if(originalTransaction.getAmount() != splitAmountSum) {
            throw new AppException(ErrorCode.INVALID_SPLIT_AMOUNT, "TransactionService - 003");
        }

        //dto > data > originalTransaction
        AddSplitTransactionsResponseDto.OriginalTransactionDto originalTransactionDto = AddSplitTransactionsResponseDto.OriginalTransactionDto.builder()
                .transactionId(originalTransaction.getUuid())
                .type(originalTransaction.getType())
                .opponentAccountNo(originalTransaction.getOpponentAccountNo())
                .amount(originalTransaction.getAmount())
                .transactionAt(originalTransaction.getTransactionAt())
                .build();
        
        // dto
        AddSplitTransactionsResponseDto addSplitTransactionsResponseDto = AddSplitTransactionsResponseDto.builder()
                .success(true)
                .message("[TransactionService - 004] 금액 나누기 성공")
                .data(AddSplitTransactionsResponseDto.Data.builder().originalTransaction(originalTransactionDto).splitTransactions(splitTransactionDtos).build())
                .build();

        // 응답
        return addSplitTransactionsResponseDto;
    }

    /**
     * 6-2-2 더치페이
     */
    public AddDutchPayTransactionsResponseDto addDutchPayTransactions(Long userId, String accountUuid, String transactionUuid, Integer n) {

        // userId != account userId 이면 403 응답
        Account account = accountRepository.findByUuid(accountUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 001"));
        if(userId != account.getUser().getId()) {
            throw new AppException(ErrorCode.FORBIDDEN, "TransactionService - 002");
        }

        // transaction 조회하고 변경 전 지출금액과 거래 후 잔액 값 저장해두기
        Transaction originalTransaction = transactionRepository.findByUuid(transactionUuid).orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 003"));
        Long originalAmount = originalTransaction.getAmount();
        Long originalBalance = originalTransaction.getBalance();

        // 1/n 계산
        Long perPersonAmount = originalAmount / n;

        // originalTransaction의 지출금액과 거래 후 잔액 값 조정
        originalTransaction.minusAmount(originalAmount - perPersonAmount);
        originalTransaction.addBalance(originalBalance - perPersonAmount);

        // originalTransaction이 속한 슬롯의 지출금액 조정
        originalTransaction.getAccountSlot().minusSpent(originalAmount- perPersonAmount);

        // 미분류 슬롯에 들어갈 트랜잭션 객체 하나 더 만들고 save.
        // 이 계좌의 미분류 슬롯 객체 조회
        AccountSlot uncategorizedAccountSlot = accountSlotRepository.findByAccountAndName(account, "미분류").orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "TransactionService - 004"));
        Transaction newTransaction = Transaction.builder()
                .account(account)
                .accountSlot(uncategorizedAccountSlot)
                .uniqueNo(originalTransaction.getUniqueNo())
                .type(originalTransaction.getType())
                .opponentAccountNo(originalTransaction.getOpponentAccountNo())
                .summary(originalTransaction.getSummary())
                .amount(originalAmount - perPersonAmount)
                .balance(originalBalance)
                .transactionAt(originalTransaction.getTransactionAt())
                .build();

        transactionRepository.save(newTransaction);

        // 미분류 슬롯의 지출금액 증가
        uncategorizedAccountSlot.addSpent(originalAmount - perPersonAmount);

        // dto > data > originalTransaction
        // originalTrnasaction의 accountSlot 조회
        AccountSlot originalAccountSlot = originalTransaction.getAccountSlot();

        // originalAccountSlot에 초과된 금액 계산 (초과하지 않았으면 0으로 세팅)
        Long originalAccountSlotExceededBudget = originalAccountSlot.getSpent() - originalAccountSlot.getCurrentBudget();
        if(originalAccountSlotExceededBudget < 0) {
            originalAccountSlotExceededBudget = 0L;
        }

        // originalAccountSlot에 남은 금액 계산 (남지 않았으면 0으로 세팅)
        Long originalAccountSlotRemainingBudget = originalAccountSlot.getCurrentBudget() - originalAccountSlot.getSpent();
        if(originalAccountSlotRemainingBudget < 0) {
            originalAccountSlotRemainingBudget = 0L;
        }

        // dto > data > originalTransaction > slotDto
        AddDutchPayTransactionsResponseDto.SlotDto originalSlotDto = AddDutchPayTransactionsResponseDto.SlotDto.builder()
                .accountSlotId(originalAccountSlot.getUuid())
                .name(originalAccountSlot.getSlot().getName())
                .isSaving(originalAccountSlot.getSlot().isSaving())
                .icon(originalAccountSlot.getSlot().getIcon())
                .color(originalAccountSlot.getSlot().getColor())
                .isCustom(originalAccountSlot.isCustom())
                .customName(originalAccountSlot.getCustomName())
                .currentBudget(originalAccountSlot.getCurrentBudget())
                .spent(originalAccountSlot.getSpent())
                .remainingBudget(originalAccountSlotRemainingBudget)
                .isBudgetExceeded(originalAccountSlot.isBudgetExceeded())
                .exceededBudget(originalAccountSlotExceededBudget)
                .build();

        // dto > data > originalTransaction > transactionDto
        AddDutchPayTransactionsResponseDto.TransactionDto originalTransactionDto = AddDutchPayTransactionsResponseDto.TransactionDto.builder()
                .transactionId(originalTransaction.getUuid())
                .type(originalTransaction.getType())
                .opponentAccountNo(originalTransaction.getOpponentAccountNo())
                .summary(originalTransaction.getSummary())
                .amount(originalAmount)
                .balance(originalBalance)
                .transactionAt(originalTransaction.getTransactionAt())
                .build();

        // uncategorizedAccountSlot에 초과된 금액 계산 (초과하지 않았으면 0으로 세팅)
        Long uncategorizedAccountSlotExceededBudget = originalAccountSlot.getSpent() - originalAccountSlot.getCurrentBudget();
        if(uncategorizedAccountSlotExceededBudget < 0) {
            uncategorizedAccountSlotExceededBudget = 0L;
        }

        // uncategorizedAccountSlot에 남은 금액 계산 (남지 않았으면 0으로 세팅)
        Long uncategorizedAccountSlotRemainingBudget = originalAccountSlot.getCurrentBudget() - originalAccountSlot.getSpent();
        if(uncategorizedAccountSlotRemainingBudget < 0) {
            uncategorizedAccountSlotRemainingBudget = 0L;
        }
        // dto > data > dutchPayTransactions > slotDto > 1
        AddDutchPayTransactionsResponseDto.SlotDto dutchPaySlotDto1 = AddDutchPayTransactionsResponseDto.SlotDto.builder()
                .accountSlotId(uncategorizedAccountSlot.getUuid())
                .name(uncategorizedAccountSlot.getSlot().getName())
                .isSaving(uncategorizedAccountSlot.getSlot().isSaving())
                .icon(uncategorizedAccountSlot.getSlot().getIcon())
                .color(uncategorizedAccountSlot.getSlot().getColor())
                .isCustom(uncategorizedAccountSlot.isCustom())
                .customName(uncategorizedAccountSlot.getCustomName())
                .currentBudget(uncategorizedAccountSlot.getCurrentBudget())
                .spent(uncategorizedAccountSlot.getSpent())
                .remainingBudget(uncategorizedAccountSlotRemainingBudget)
                .isBudgetExceeded(uncategorizedAccountSlot.isBudgetExceeded())
                .exceededBudget(uncategorizedAccountSlotExceededBudget)
                .build();

        // dto > data > dutchPayTransactions > transactionDto > 0
        AddDutchPayTransactionsResponseDto.TransactionDto dutchPayTransactionDto0 = AddDutchPayTransactionsResponseDto.TransactionDto.builder()
                .transactionId(originalTransaction.getUuid())
                .type(originalTransaction.getType())
                .opponentAccountNo(originalTransaction.getOpponentAccountNo())
                .summary(originalTransaction.getSummary())
                .amount(originalTransaction.getAmount())
                .balance(originalTransaction.getBalance())
                .transactionAt(originalTransaction.getTransactionAt())
                .build();

        // dto > data > dutchPayTransactions > transactionDto > 1
        AddDutchPayTransactionsResponseDto.TransactionDto dutchPayTransactionDto1 = AddDutchPayTransactionsResponseDto.TransactionDto.builder()
                .transactionId(newTransaction.getUuid())
                .type(newTransaction.getType())
                .opponentAccountNo(newTransaction.getOpponentAccountNo())
                .summary(newTransaction.getSummary())
                .amount(newTransaction.getAmount())
                .balance(newTransaction.getBalance())
                .transactionAt(newTransaction.getTransactionAt())
                .build();

        List<AddDutchPayTransactionsResponseDto.SlotAndTransactionDto> dutchPayTransactions = new ArrayList<>();
        dutchPayTransactions.add(AddDutchPayTransactionsResponseDto.SlotAndTransactionDto.builder().slot(originalSlotDto).transaction(dutchPayTransactionDto0).build());
        dutchPayTransactions.add(AddDutchPayTransactionsResponseDto.SlotAndTransactionDto.builder().slot(dutchPaySlotDto1).transaction(dutchPayTransactionDto1).build());

        // dto > data
        AddDutchPayTransactionsResponseDto.Data data = AddDutchPayTransactionsResponseDto.Data.builder()
                .originalTransaction(AddDutchPayTransactionsResponseDto.SlotAndTransactionDto.builder().slot(originalSlotDto).transaction(originalTransactionDto).build())
                .dutchPayTransactions(dutchPayTransactions)
                .build();

        // dto
        AddDutchPayTransactionsResponseDto addDutchPayTransactionsResponseDto = AddDutchPayTransactionsResponseDto.builder()
                .success(true)
                .message("[TransactionService - 000] 더치페이 성공")
                .data(data)
                .build();

        // 응답
        return addDutchPayTransactionsResponseDto;
    }
}
