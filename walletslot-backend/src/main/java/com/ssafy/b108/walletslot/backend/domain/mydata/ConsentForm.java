package com.ssafy.b108.walletslot.backend.domain.mydata;

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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    private String title;

    @OneToMany(mappedBy = "consentForm", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserConsent> userConsents;
}
