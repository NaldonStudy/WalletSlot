package com.ssafy.b108.walletslot.backend.domain.ai_report;

import com.ssafy.b108.walletslot.backend.domain.account.Account;
import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "ai_report")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Type(JsonType.class)
    @Column(columnDefinition = "json", nullable = false)
    private Map<String, Object> content; // JSON → String 매핑

    private LocalDateTime createdAt;
}
