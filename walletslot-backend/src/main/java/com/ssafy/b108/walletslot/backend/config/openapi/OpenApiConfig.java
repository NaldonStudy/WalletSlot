package com.ssafy.b108.walletslot.backend.config.openapi;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
        info = @Info(
                title = "WalletSlot API Docs",
                description = "SSAFY 13기 특화 프로젝트 WalletSlot API Docs 입니다.",
                version = "v1.0.0"
        )
)
@Configuration
public class OpenApiConfig {
}
