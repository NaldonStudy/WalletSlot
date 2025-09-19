package com.ssafy.b108.walletslot.backend.domain.auth.controller;

import com.ssafy.b108.walletslot.backend.domain.auth.service.AuthService;
import com.ssafy.b108.walletslot.backend.global.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    public record LoginRequest(@NotBlank String phone,
                               @NotBlank String pin,
                               @NotBlank String deviceId) {}
    public record AccessToken(String accessToken) {}

    @PostMapping("/login")
    public ApiResponse<AccessToken> login(@Valid @RequestBody LoginRequest req){
        String at = authService.loginForAccessOnly(req.phone(), req.pin(), req.deviceId());
        return ApiResponse.ok(new AccessToken(at));
    }

}
