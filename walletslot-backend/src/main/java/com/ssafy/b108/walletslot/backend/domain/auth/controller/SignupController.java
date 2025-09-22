// SignupController.java
package com.ssafy.b108.walletslot.backend.domain.auth.controller;

import com.ssafy.b108.walletslot.backend.domain.auth.dto.*;
import com.ssafy.b108.walletslot.backend.domain.auth.service.SignupService;
import com.ssafy.b108.walletslot.backend.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class SignupController {

    private final SignupService signupService;

    @PostMapping("/signup")
    @Operation(
            summary = "회원가입(원샷)",
            description = "문자인증 완료 후 받은 signupTicket과 모든 가입정보를 한 번에 제출",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(schema = @Schema(implementation = SignupRequest.class),
                            examples = @ExampleObject(value = """
                            {
                              "name":"김싸피","phone":"01012345678","gender":"MAN","birthDate":"1999-09-09",
                              "signupTicket":"3af3-...", "pin":"1234","baseDay":10,"job":"OFFICE_WORKER",
                              "deviceId":"A1B2C3D4","platform":"ANDROID","pushToken":"fcm-xxx","pushEnabled":true
                            }
                            """))),
            responses = @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "가입 성공",
                    content = @Content(schema = @Schema(implementation = SignupResponse.class),
                            examples = @ExampleObject(value = """
                            { "success":true, "data":{ "userId":1, "accessToken":"ey...", "refreshToken":"ey..." }, "message":null }
                            """)))
    )
    public ApiResponse<SignupResponse> signup(@Valid @RequestBody SignupRequest req) {
        return ApiResponse.ok(signupService.signup(req));
    }
}
