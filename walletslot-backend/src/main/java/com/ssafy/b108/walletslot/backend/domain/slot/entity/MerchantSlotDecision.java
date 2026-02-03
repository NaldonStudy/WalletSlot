package com.ssafy.b108.walletslot.backend.domain.slot.entity;

import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "merchant_slot_decision")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MerchantSlotDecision {

    // Field
    @Id
    @Column(length = 64, nullable = false)
    private String name_id;

    @Column(length = 255)
    private String merchantName;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private JsonNode merchantCategoryJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id")
    private Slot slot;   // FK 매핑 (nullable 허용, ON DELETE SET NULL)

    @Column(length = 100)
    private String slotName;

    @Column(insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
