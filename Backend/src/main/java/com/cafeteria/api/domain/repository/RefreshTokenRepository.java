package com.cafeteria.api.domain.repository;

import com.cafeteria.api.domain.entity.RefreshToken;
import com.cafeteria.api.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositório de refresh tokens. Lookup é feito pelo hash SHA-256 do token —
 * o token bruto nunca é armazenado.
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    /** Busca pelo hash SHA-256 do token enviado pelo cliente. */
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /**
     * Revoga todos os refresh tokens ativos de um usuário. Usado quando
     * detectamos reuso de um refresh já consumido — assumimos comprometimento
     * e forçamos novo login em todas as sessões.
     */
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user AND r.revoked = false")
    int revokeAllForUser(@Param("user") User user);
}
