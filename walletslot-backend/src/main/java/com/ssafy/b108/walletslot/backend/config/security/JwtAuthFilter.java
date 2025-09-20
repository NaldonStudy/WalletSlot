package com.ssafy.b108.walletslot.backend.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER   = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    // 인증을 통과시킬 경로 프리픽스
    private static final Set<String> WHITELIST_PREFIX = Set.of(
            "/api/auth",
            "/swagger-ui/",
            "/v3/api-docs",
            "/swagger-resources",
            "/webjars/",
            "/actuator/health",
            "/error"
    );

    private final JwtProvider jwtProvider;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // CORS Preflight는 항상 패스
        if (HttpMethod.OPTIONS.matches(request.getMethod())) return true;

        final String path = request.getRequestURI();
        return isWhitelisted(path);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        final String token = resolveBearerToken(req);
        if (token != null && jwtProvider.validate(token)) {
            final Authentication auth = jwtProvider.getAuthentication(token);
            if (auth != null) {
                // 토큰의 deviceId(did)를 details에 심어 DeviceBindingFilter가 활용하도록 함
                if (auth instanceof AbstractAuthenticationToken aat) {
                    String did = safelyExtractDid(token); // 실패해도 null 허용
                    aat.setDetails(did);
                }
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        chain.doFilter(req, res);
    }

    /* ------------------------ helpers ------------------------ */

    private boolean isWhitelisted(String path) {
        return WHITELIST_PREFIX.stream().anyMatch(path::startsWith);
    }

    private String resolveBearerToken(HttpServletRequest req) {
        final String authz = req.getHeader(AUTH_HEADER);
        if (authz == null || !authz.startsWith(BEARER_PREFIX)) return null;
        return authz.substring(BEARER_PREFIX.length());
    }

    private String safelyExtractDid(String token) {
        try {
            return jwtProvider.extractDeviceId(token);
        } catch (Exception ignored) {
            return null; // details 없음 → DeviceBindingFilter에서 토큰 재파싱 fallback
        }
    }
}
