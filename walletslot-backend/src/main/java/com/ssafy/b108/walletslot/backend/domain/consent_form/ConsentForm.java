package com.ssafy.b108.walletslot.backend.domain.consent_form;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "consent_form")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsentForm {

    // Field
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(columnDefinition= "TEXT")
    private String title;

    @OneToMany(mappedBy = "consentForm", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserConsent> userConsents;
}
