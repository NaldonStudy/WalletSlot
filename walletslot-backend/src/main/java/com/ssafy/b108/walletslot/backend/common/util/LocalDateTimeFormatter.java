package com.ssafy.b108.walletslot.backend.common.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

public class LocalDateTimeFormatter {

    // Method
    public static Map<String, String> formatter(LocalDateTime localDateTime) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HHmmss");

        return Map.of(
                "date", localDateTime.format(dateFormatter),
                "time", localDateTime.format(timeFormatter)
        );
    }
}
