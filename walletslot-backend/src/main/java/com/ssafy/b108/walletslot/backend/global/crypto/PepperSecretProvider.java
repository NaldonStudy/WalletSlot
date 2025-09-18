package com.ssafy.b108.walletslot.backend.global.crypto;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.kms.KmsClient;
import software.amazon.awssdk.services.kms.model.DecryptRequest;

import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class PepperSecretProvider {

    private final KmsClient kms;
    private final Map<String, String> cipherMap; // alias -> KMS 암호문(Base64)
    private final ConcurrentHashMap<String, String> cache = new ConcurrentHashMap<>();

    // ✅ 명시적 생성자만 유지 (@RequiredArgsConstructor 제거!)
    public PepperSecretProvider(
            KmsClient kms,
            @Value("#{${app.security.pepper.cipher:{}}}") Map<String, String> cipherMap
    ) {
        this.kms = kms;
        this.cipherMap = cipherMap;
    }

    public String getSecret(String alias) {
        return cache.computeIfAbsent(alias, this::decryptOnce);
    }

    private String decryptOnce(String alias) {
        String b64 = cipherMap.get(alias);
        if (b64 == null || b64.isBlank()) {
            throw new IllegalStateException("Unknown pepper alias: " + alias);
        }
        byte[] cipherBytes = Base64.getDecoder().decode(b64);
        var resp = kms.decrypt(DecryptRequest.builder()
                .ciphertextBlob(SdkBytes.fromByteArray(cipherBytes))
                .build());
        return resp.plaintext().asUtf8String();
    }
}
