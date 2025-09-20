package com.ssafy.b108.walletslot.backend.common.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

public class LocalDateTimeFormatter {

    // Method
    public static Map<String, String> formatter() {
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Seoul"));
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HHmmss");

        return Map.of(
                "date", now.format(dateFormatter),
                "time", now.format(timeFormatter)
        );
    }
}
