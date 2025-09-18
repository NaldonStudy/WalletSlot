package com.ssafy.b108.walletslot.backend.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class DeviceBindingFilter extends OncePerRequestFilter {

    private static final String DEVICE_HEADER = "X-Device-Id";
    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtProvider jwtProvider;

    /**
     * Swagger/문서/퍼블릭/프리플라이트 등은 디바이스 바인딩 검사에서 제외.
     * 보호 API(/api/**)만 검사한다.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String uri = request.getRequestURI();
        String method = request.getMethod();

        // 프리플라이트
        if ("OPTIONS".equalsIgnoreCase(method)) return true;

        // /api/** 가 아니면 (예: /swagger-ui, /v3/api-docs, /actuator 등) 스킵
        if (!uri.startsWith("/api/")) return true;

        // 인증/리프레시/퍼블릭 핑은 스킵
        if (uri.startsWith("/api/auth/")) return true;
        if ("/api/ping/public".equals(uri)) return true;

        // 그 외 /api/** 는 검사 대상
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        // 이전 단계(JWT 인증 필터)에서 인증된 요청만 검사
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            chain.doFilter(req, res);
            return;
        }

        // 헤더에서 디바이스ID/토큰 추출
        String headerDid = req.getHeader(DEVICE_HEADER);
        String authz = req.getHeader(AUTH_HEADER);
        String token = (authz != null && authz.startsWith(BEARER_PREFIX))
                ? authz.substring(BEARER_PREFIX.length())
                : null;

        // 토큰에서 did 추출
        String tokenDid = null;
        if (token != null) {
            try {
                tokenDid = jwtProvider.extractDeviceId(token);
            } catch (Exception e) {
                // 토큰 파싱 실패도 불일치로 처리
                writeForbidden(res, "디바이스 불일치");
                return;
            }
        }

        // 둘 다 존재하고 동일해야 통과
        if (headerDid == null || tokenDid == null || !Objects.equals(headerDid, tokenDid)) {
            writeForbidden(res, "디바이스 불일치");
            return;
        }

        chain.doFilter(req, res);
    }

    private void writeForbidden(HttpServletResponse res, String message) throws IOException {
        res.setStatus(HttpServletResponse.SC_FORBIDDEN);
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
