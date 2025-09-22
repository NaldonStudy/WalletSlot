package com.ssafy.b108.walletslot.backend.domain.user.service;

import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import com.ssafy.b108.walletslot.backend.domain.user.repository.EmailRepository;
import com.ssafy.b108.walletslot.backend.domain.user.repository.UserRepository;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import com.ssafy.b108.walletslot.backend.infrastructure.ssafy.SsafyMemberClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserKeyLinkService {

    private final UserRepository userRepo;
    private final EmailRepository emailRepo;
    private final SsafyMemberClient ssafy;

    /** 회원가입 직후 한 번 호출 (또는 최초 금융 기능 이용 시) */
    @Transactional
    public void fetchAndBindUserKey(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[UserKeyLink - 001] user not found"));

        if (user.getUserKey() != null && !user.getUserKey().isBlank()) return;

        // 우선순위: (1) userId의 최신 이메일 → (2) user.name 매칭 이메일 → (3) name 단독 검색
        String email = emailRepo.findFirstByUserIdOrderByIdDesc(userId)
                .or(() -> emailRepo.findFirstByUserIdAndNameOrderByIdDesc(userId, user.getName()))
                .or(() -> emailRepo.findFirstByNameOrderByIdDesc(user.getName()))
                .map(e -> e.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "[UserKeyLink - 002] email not found"));

        String userKey = ssafy.getOrCreateUserKeyByEmail(email);
        if (userKey == null || userKey.isBlank()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "[UserKeyLink - 003] empty userKey from SSAFY");
        }

        user.assignUserKey(userKey); // dirty checking
    }

    /** SSAFY API 호출 전 필수 보장 */
    @Transactional(readOnly = true)
    public String requireUserKey(Long userId) {
        return userRepo.findById(userId)
                .map(User::getUserKey)
                .filter(k -> k != null && !k.isBlank())
                .orElseThrow(() -> new AppException(ErrorCode.FORBIDDEN, "[UserKeyLink - 004] userKey not linked"));
    }
}
