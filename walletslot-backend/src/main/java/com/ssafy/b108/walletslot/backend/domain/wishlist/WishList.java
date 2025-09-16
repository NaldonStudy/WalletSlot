package com.ssafy.b108.walletslot.backend.domain.wishlist;

import com.ssafy.b108.walletslot.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wish_list")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;

    private Long price;

    @Lob
    private byte[] image;
}
