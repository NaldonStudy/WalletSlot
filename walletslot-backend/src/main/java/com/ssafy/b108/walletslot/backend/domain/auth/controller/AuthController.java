package com.ssafy.b108.walletslot.backend.domain.auth.controller;

import com.ssafy.b108.walletslot.backend.config.security.UserPrincipal;
import com.ssafy.b108.walletslot.backend.domain.auth.dto.*;
import com.ssafy.b108.walletslot.backend.domain.auth.service.AuthService;
import com.ssafy.b108.walletslot.backend.domain.auth.service.RefreshTokenService;
import com.ssafy.b108.walletslot.backend.global.error.AppException;
import com.ssafy.b108.walletslot.backend.global.error.ErrorCode;
import com.ssafy.b108.walletslot.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    // 2-1. 로그인(Access만) — 기존 계약 유지
    @PostMapping("/login")
    @Operation(
            summary = "2-1. 로그인 (Access 발급)",
            description = "전화번호+PIN+deviceId로 Access 토큰 발급",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true, content = @Content(schema = @Schema(implementation = LoginRequest.class),
                    examples = @ExampleObject(value = """
                        { "phone": "01012345678", "pin": "1234", "deviceId": "A1B2C3D4" }
                    """))),
            responses = @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    content = @Content(schema = @Schema(implementation = AccessToken.class),
                            examples = @ExampleObject(value = """
                        { "success": true, "data": { "accessToken": "ey..." }, "message": null }
                    """)))
    )
    public ApiResponse<AccessToken> login(@Valid @RequestBody LoginRequest req){
        String at = authService.loginForAccessOnly(req.getPhone(), req.getPin(), req.getDeviceId());
        return ApiResponse.ok(new AccessToken(at));
    }

    // 2-1+. 로그인(Access/Refresh 동시 발급) — 새 권장 경로
    @PostMapping("/login/full")
    @Operation(
            summary = "2-1+. 로그인 (Access/Refresh 동시 발급)",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true, content = @Content(schema = @Schema(implementation = LoginRequest.class))),
            responses = @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    content = @Content(schema = @Schema(implementation = Tokens.class),
                            examples = @ExampleObject(value = """
                        { "success": true, "data": { "accessToken": "ey...", "refreshToken": "ey..." }, "message": null }
                    """)))
    )
    public ApiResponse<Tokens> loginFull(@Valid @RequestBody LoginRequest req) {
        // AuthService가 AT/RT 발급 및 RT 저장까지 수행
        Tokens tokens = authService.login(req.getPhone(), req.getPin(), req.getDeviceId());
        return ApiResponse.ok(tokens);
    }

    // 2-2. 재발급 (Refresh → Access/Refresh)
    @PostMapping("/refresh")
    @Operation(
            summary = "2-2. 토큰 재발급 (Refresh → Access/Refresh)",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true, content = @Content(schema = @Schema(implementation = RefreshRequest.class))),
            responses = @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                    content = @Content(schema = @Schema(implementation = Tokens.class)))
    )
    public ApiResponse<Tokens> refresh(@Valid @RequestBody RefreshRequest req) {
        Tokens tokens = refreshTokenService.rotate(req.getRefreshToken(), req.getDeviceId());
        return ApiResponse.ok(tokens);
    }

    // 2-3. 로그아웃 (Refresh 폐기)
    @PostMapping("/logout")
    @Operation(
            summary = "2-3. 로그아웃 (Refresh 폐기)",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true, content = @Content(schema = @Schema(implementation = LogoutRequest.class)))
    )
    public ApiResponse<Void> logout(@Valid @RequestBody LogoutRequest req) {
        refreshTokenService.revoke(req.getRefreshToken(), req.getDeviceId());
        return ApiResponse.ok();
    }

    // 2-4. 내 프로필
    @GetMapping("/me")
    @Operation(summary = "2-4. 내 프로필 조회")
    public ApiResponse<MyProfile> me(@AuthenticationPrincipal final UserPrincipal principal) {
        var u = authService.getMyProfile(principal.userId());
        return ApiResponse.ok(MyProfile.builder()
                .id(u.getId()).uuid(u.getUuid()).name(u.getName()).phoneNumber(u.getPhoneNumber())
                .gender(u.getGender()==null?null:u.getGender().name())
                .birthDate(u.getBirthDate().toLocalDate())
                .baseDay((int) u.getBaseDay())
                .job(u.getJob()==null?null:u.getJob().name())
                .createdAt(u.getCreatedAt()).updatedAt(u.getUpdatedAt()).build());
    }

    // 2-5. PIN 재설정 요청
    @PostMapping("/password/reset-request")
    @Operation(summary = "2-5. PIN 재설정 요청 (SMS 발송)")
    public ApiResponse<SmsSendResponse> requestPinReset(@Valid @RequestBody PinResetRequest req) {
        boolean sent = authService.requestPinReset(req.getPhone());
        return ApiResponse.ok(new SmsSendResponse(sent));
    }

    // 2-6. PIN 재설정
    @PostMapping("/password/reset")
    @Operation(summary = "2-6. PIN 재설정 (코드 소비)")
    public ApiResponse<Void> resetPin(@Valid @RequestBody PinResetConsumeRequest req) {
        authService.resetPin(req.getPhone(), req.getResetCode(), req.getNewPin());
        return ApiResponse.ok();
    }

    // 2-7. PIN 변경
    @PatchMapping("/pin")
    @Operation(summary = "2-7. PIN 변경 (로그인 상태)")
    public ApiResponse<Void> changePin(@AuthenticationPrincipal final UserPrincipal principal,
                                       @Valid @RequestBody PinChangeRequest req) {
        authService.changePin(principal.userId(), req.getCurrentPin(), req.getNewPin());
        return ApiResponse.ok();
    }

    // 2-8. 기기 검증(선택)
    @PostMapping("/device/verify")
    @Operation(summary = "2-8. 기기 검증 (선택)")
    public ApiResponse<SmsVerifyResponse> verifyDevice(@Valid @RequestBody DeviceVerifyRequest req) {
        boolean ok = authService.verifyDevice(req.getPhone(), req.getDeviceId(), req.getCode());
        return ApiResponse.ok(new SmsVerifyResponse(ok));
    }

    // 2-9. SMS 발송
    @PostMapping("/sms/send")
    @Operation(summary = "2-9. SMS 인증코드 발송")
    public ApiResponse<SmsSendResponse> sendSms(@Valid @RequestBody SmsSendRequest req) {
        boolean sent = authService.sendSmsCode(req.getPhone(), req.getPurpose(), req.getDeviceId());
        return ApiResponse.ok(new SmsSendResponse(sent));
    }

    // 2-10. SMS 검증(일반)
    @PostMapping("/sms/verify")
    @Operation(summary = "2-10. SMS 인증코드 검증")
    public ApiResponse<SmsVerifyResponse> verifySms(@Valid @RequestBody SmsVerifyRequest req) {
        boolean verified = authService.verifySmsCode(req.getPhone(), req.getPurpose(), req.getCode());
        return ApiResponse.ok(new SmsVerifyResponse(verified));
    }

    // 가입용: SMS 검증 + 티켓 발급
    @PostMapping("/sms/verify-signup")
    @Operation(summary = "가입용 SMS 검증(+signupTicket 발급)", description = "purpose=SIGNUP 전용")
    public ApiResponse<SmsVerifyForSignupResponse> verifySmsForSignup(@Valid @RequestBody SmsVerifyRequest req) {
        boolean ok = authService.verifySmsCode(req.getPhone(), req.getPurpose(), req.getCode());
        if (!ok) return ApiResponse.ok(new SmsVerifyForSignupResponse(false, null));
        String ticket = authService.issueSignupTicket(req.getPhone(), req.getPurpose());
        return ApiResponse.ok(new SmsVerifyForSignupResponse(true, ticket));
    }

    // 2-11. 토큰 유효성 점검
    @GetMapping("/token/validate")
    @Operation(summary = "2-11. 토큰 유효성 점검")
    public ApiResponse<TokenValidateResponse> validateToken(@RequestHeader("Authorization") String authorization) {
        var r = authService.validateToken(authorization);
        return ApiResponse.ok(new TokenValidateResponse(r.valid, r.subject, r.deviceId));
    }
}
