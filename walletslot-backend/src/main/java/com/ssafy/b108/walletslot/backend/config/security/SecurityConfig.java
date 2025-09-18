package com.ssafy.b108.walletslot.backend.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final DeviceBindingFilter deviceBindingFilter;

    /* ---------------------- 운영/개발용 (test 제외) ---------------------- */
    @Bean
    @Profile("!test")
    public SecurityFilterChain appSecurityChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화
                .csrf(csrf -> csrf.disable())

                // CORS 설정
                .cors(c -> c.configurationSource(corsConfigurationSource()))

                // 기본 로그인/베이직 인증 비활성화 (이 두 줄 추가)
                .httpBasic(b -> b.disable())
                .formLogin(f -> f.disable())

                // 세션 정책 설정
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // Swagger & 문서
                        .requestMatchers(
                                "/swagger-ui/**",
                                //"/swagger-ui",
                                //"/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs",
                                "/api-docs/**",
                                "/api-docs",
                                "/swagger-resources/**",
                                "/swagger-resources",
                                "/webjars/**"
                        ).permitAll()

                        // 헬스체크 & 인증 엔드포인트
                        .requestMatchers(
                                "/actuator/health",
                                "/api/auth/**",
                                "/api/ping/public"
                        ).permitAll()

                        // CORS Preflight 허용
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .anyRequest().authenticated()
                )

                // 401/403 JSON 응답
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(jsonAuthEntryPoint())
                        .accessDeniedHandler(jsonAccessDeniedHandler())
                )

                // JWT 필터
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                // - jwtAuthFilter: Authorization 헤더의 액세스 토큰을 검증하고 SecurityContext에 Authentication 저장.
                // - deviceBindingFilter: 인증된 요청에 한해, 토큰의 did와 헤더 X-Device-Id가 같은지 검사.
                //   반드시 jwtAuthFilter "뒤"에 두어 Authentication이 채워진 뒤 실행되도록 addFilterAfter 사용.
                .addFilterAfter(deviceBindingFilter, JwtAuthFilter.class);

        return http.build();
    }


    /* ---------------------- 테스트용 (전부 허용) ---------------------- */
    @Bean
    @Profile("test")
    public SecurityFilterChain testSecurityChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    /* ---------------------- 공통 Bean ---------------------- */
    @Bean
    public AuthenticationEntryPoint jsonAuthEntryPoint() {
        return (req, res, ex) -> {
            res.setStatus(401);
            res.setCharacterEncoding(StandardCharsets.UTF_8.name());
            res.setContentType("application/json;charset=UTF-8");
            res.getWriter().write("{\"message\":\"로그인이 필요합니다.\"}");
        };
    }

    @Bean
    public AccessDeniedHandler jsonAccessDeniedHandler() {
        return (req, res, ex) -> {
            res.setStatus(403);
            res.setCharacterEncoding(StandardCharsets.UTF_8.name());
            res.setContentType("application/json;charset=UTF-8");
            res.getWriter().write("{\"message\":\"접근 권한이 없습니다.\"}");
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOriginPatterns(List.of("*")); // 프로덕션에선 화이트리스트 권장
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));

        // 허용할 헤더
        c.setAllowedHeaders(List.of("Authorization","Content-Type","X-Device-Id"));

        // 노출할 헤더
        c.setExposedHeaders(List.of("Authorization"));

        // 쿠키 허용 X
        c.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", c);
        return src;
    }
}
