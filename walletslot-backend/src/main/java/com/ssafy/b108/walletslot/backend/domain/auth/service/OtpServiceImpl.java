package com.ssafy.b108.walletslot.backend.domain.auth.service;

import com.ssafy.b108.walletslot.backend.global.error.*;
import com.ssafy.b108.walletslot.backend.infrastructure.sms.SmsSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final SmsSender smsSender;
    private static final Random RND = new Random();
    private static final int TTL_MINUTES = 10;

    private static class Otp {
        final String code;
        final Instant exp;
        Otp(String c, Instant e){
            this.code=c;this.exp=e;
        }
    }

    // key: phone|purpose
    private final Map<String, Otp> store = new ConcurrentHashMap<>();

    @Override
    public void send(String phone, String purpose, String deviceId) {
        String code = String.format("%06d", RND.nextInt(1_000_000));
        Instant exp = Instant.now().plus(TTL_MINUTES, ChronoUnit.MINUTES);
        store.put(key(phone, purpose), new Otp(code, exp));

        String msg = String.format("[Wallet Slot] 인증번호 %s (유효 %d분)", code, TTL_MINUTES);
        if (!smsSender.sendText(phone, msg)) throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "문자 발송 실패");
    }

    @Override
    public boolean verify(String phone, String purpose, String code) {
        Otp otp = store.get(key(phone, purpose));

        if (otp == null) throw new AppException(ErrorCode.OTP_INVALID, "코드를 먼저 요청하세요.");

        if (Instant.now().isAfter(otp.exp)) {
            store.remove(key(phone, purpose));
            throw new AppException(ErrorCode.OTP_EXPIRED, "코드가 만료되었습니다.");
        }

        boolean ok = otp.code.equals(code);

        if (ok)
            store.remove(key(phone, purpose)); // 1회성

        return ok;
    }

    private String key(String phone, String purpose){
        return phone + "|" + purpose;
    }
}
