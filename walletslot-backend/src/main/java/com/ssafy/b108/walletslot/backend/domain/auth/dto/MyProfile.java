package com.ssafy.b108.walletslot.backend.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyProfile {
    private Long id;
    private String uuid;
    private String name;
    private String phoneNumber;

    @Schema(example = "MAN")
    private String gender;

    @Schema(example = "1999-09-09")
    private LocalDate birthDate;

    @Schema(example = "10")
    private Integer baseDay;

    @Schema(example = "OFFICE_WORKER")
    private String job;

    @Schema(example = "2025-09-21T11:22:33")
    private LocalDateTime createdAt;

    @Schema(example = "2025-09-22T01:02:03")
    private LocalDateTime updatedAt;
}
