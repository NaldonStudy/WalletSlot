package com.ssafy.b108.walletslot.backend.support;

import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/ping")
public class PingController {
    // 공개 엔드포인트(인증 불필요)
    @GetMapping("/public")
    public Map<String,Object> pub(){
        return Map.of("ok", true, "ts", Instant.now().toString());
    }

    // 보호 엔드포인트(인증 필요)
    @GetMapping("/protected")
    public Map<String,Object> prot(){
        return Map.of("ok", true, "who", "authenticated");
    }
}
