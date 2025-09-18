package com.ssafy.b108.walletslot.backend.config.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class DeviceBindingFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        // 이전 단계(JWT 인증 필터)에서 이미 인증이 완료된 요청만 검사
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            // 헤더에서 디바이스ID와 Authorization(액세스 토큰) 추출
            String headerDid = req.getHeader("X-Device-Id");
            String authz = req.getHeader("Authorization");
            String token = (authz != null && authz.startsWith("Bearer ")) ? authz.substring(7) : null;

            // 토큰에 들어있는 did와 헤더의 X-Device-Id 비교
            String tokenDid = token == null ? null : jwtProvider.extractDeviceId(token);

            if (tokenDid == null || headerDid == null || !tokenDid.equals(headerDid)) {
                // 불일치하면 403 반환
                res.setStatus(403);
                res.setContentType("application/json;charset=UTF-8");
                res.getWriter().write("{\"message\":\"디바이스 불일치\"}");
                return;
            }
        }
        // 통과
        chain.doFilter(req, res);
    }
}
