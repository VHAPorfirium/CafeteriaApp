package com.cafeteria.api.security;

import com.cafeteria.api.domain.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

/**
 * Geração e validação de JSON Web Tokens (HS256).
 *
 * <p>Estratégia da camada de auth:
 * <ul>
 *   <li><b>Access token</b> (este service): JWT auto-contido, vida curta (15min),
 *       contém {@code sub} (userId), {@code email}, {@code role}, {@code name}.</li>
 *   <li><b>Refresh token</b>: opaco (UUID), longa duração, persistido como
 *       hash SHA-256 na tabela {@code refresh_tokens} — ver
 *       {@link com.cafeteria.api.application.service.AuthService}.</li>
 * </ul>
 *
 * <p>O segredo HS256 vem de {@code app.security.jwt.secret} (env var em prod).
 * Sempre use um segredo com ≥ 256 bits.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final Duration accessTtl;

    public JwtService(@Value("${app.security.jwt.secret}") String secret,
                      @Value("${app.security.jwt.access-token-ttl-minutes}") long accessTtlMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTtl = Duration.ofMinutes(accessTtlMinutes);
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("name", user.getName())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessTtl)))
                .signWith(key)
                .compact();
    }

    public long getAccessTtlSeconds() {
        return accessTtl.getSeconds();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parse(token).getSubject());
    }

    public String extractEmail(String token) {
        return extract(token, c -> c.get("email", String.class));
    }

    public String extractRole(String token) {
        return extract(token, c -> c.get("role", String.class));
    }

    public boolean isValid(String token) {
        try {
            Claims c = parse(token);
            return c.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private <T> T extract(String token, Function<Claims, T> fn) {
        return fn.apply(parse(token));
    }
}
