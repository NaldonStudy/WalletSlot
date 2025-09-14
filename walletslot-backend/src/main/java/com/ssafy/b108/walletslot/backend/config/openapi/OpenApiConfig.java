package com.ssafy.b108.walletslot.backend.config.openapi;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(
                title = "WalletSlot API 명세서 테스트",
                description = "SSAFY 13기 특화 프로젝트 WalletSlot API 명세서입니다.",
                version = "v1.0.0"
        )
)
@Configuration
public class OpenApiConfig {
}
