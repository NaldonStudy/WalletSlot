package com.ssafy.b108.walletslot.backend.domain.auth.service;

public interface OtpService {
    void send(String phone, String purpose, String deviceId);
    boolean verify(String phone, String purpose, String code);
}
