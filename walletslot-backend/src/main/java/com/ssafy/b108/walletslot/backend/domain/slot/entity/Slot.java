package com.ssafy.b108.walletslot.backend.domain.slot.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "slot")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slot {

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    @Builder.Default
    private String uuid = UUID.randomUUID().toString();

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private boolean isSaving = false;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String icon;

    @Column(nullable = false, length = 64)
    private String color;

    @Column(nullable = false)
    private Integer rank;

    @OneToMany(mappedBy = "slot", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AccountSlot> accountSlots;
}
