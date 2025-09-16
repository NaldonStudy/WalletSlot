package com.ssafy.b108.walletslot.backend.domain.account;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Account")
public class AccountRestController {

    // Method
    @GetMapping
    public void test() {

    }
}
