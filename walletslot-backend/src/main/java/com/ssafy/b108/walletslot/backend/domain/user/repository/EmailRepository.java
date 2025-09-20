package com.ssafy.b108.walletslot.backend.domain.user.repository;

import com.ssafy.b108.walletslot.backend.domain.user.entity.Email;
import com.ssafy.b108.walletslot.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailRepository extends JpaRepository<Email, Long> {
    Optional<Email> findByUser(User user);
}
