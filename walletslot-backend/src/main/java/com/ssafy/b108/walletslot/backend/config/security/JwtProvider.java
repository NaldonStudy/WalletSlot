package com.ssafy.b108.walletslot.backend.config.security;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtProvider {

    // Base64 문자열로 받은 HS256 키 (ENV/Secrets)
    @Value("${app.security.jwt.secret_b64}") private String secretB64;
    @Value("${app.security.jwt.access-ttl-minutes:15}") private long accessTtlMinutes;

    private byte[] key() {
        return Base64.getDecoder().decode(secretB64); // Base64 → byte[]
    }

    // 액세스 토큰 발급 (sub=userId, did=deviceId)
    public String createAccessToken(Long userId, String deviceId) {
        Instant now = Instant.now();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(String.valueOf(userId))
                .claim("did", deviceId)
                .jwtID(UUID.randomUUID().toString())
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plusSeconds(accessTtlMinutes * 60)))
                .build();
        try {
            SignedJWT jwt = new SignedJWT(
                    new JWSHeader.Builder(JWSAlgorithm.HS256).type(JOSEObjectType.JWT).build(),
                    claims
            );
            jwt.sign(new MACSigner(key()));
            return jwt.serialize();
        } catch (Exception e) {
            throw new RuntimeException("JWT signing failed", e);
        }
    }

    // 서명 + 만료만 검증 (간단)
    public boolean validate(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            if (!jwt.verify(new MACVerifier(key()))) return false;
            Date exp = jwt.getJWTClaimsSet().getExpirationTime();
            return exp != null && exp.after(new Date());
        } catch (Exception e) { return false; }
    }

    public Authentication getAuthentication(String token) {
        try {
            var sub = SignedJWT.parse(token).getJWTClaimsSet().getSubject();
            return (sub == null) ? null : new UsernamePasswordAuthenticationToken("user:" + sub, null, List.of());
        } catch (Exception e) { return null; }
    }

    public String extractDeviceId(String token) {
        try {
            Object did = SignedJWT.parse(token).getJWTClaimsSet().getClaim("did");
            return did == null ? null : did.toString();
        } catch (Exception e) { return null; }
    }
}
