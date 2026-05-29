package com.cafeteria.api.application.service;

import com.cafeteria.api.application.dto.request.LoginRequest;
import com.cafeteria.api.application.dto.request.RegisterRequest;
import com.cafeteria.api.application.dto.response.AuthResponse;
import com.cafeteria.api.application.mapper.UserMapper;
import com.cafeteria.api.config.RateLimitConfig.LoginRateLimiter;
import com.cafeteria.api.domain.entity.Cart;
import com.cafeteria.api.domain.entity.RefreshToken;
import com.cafeteria.api.domain.entity.User;
import com.cafeteria.api.domain.enums.UserRole;
import com.cafeteria.api.domain.repository.CartRepository;
import com.cafeteria.api.domain.repository.RefreshTokenRepository;
import com.cafeteria.api.domain.repository.UserRepository;
import com.cafeteria.api.exception.BusinessException;
import com.cafeteria.api.exception.DuplicateResourceException;
import com.cafeteria.api.exception.InvalidTokenException;
import com.cafeteria.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Serviço de autenticação: registro, login, refresh e logout.
 *
 * <p>Estratégia de tokens (apresentada em sala em 11/05):
 * <ul>
 *   <li><b>Access token</b> — JWT HS256, vida curta (15 min). Não pode ser revogado.</li>
 *   <li><b>Refresh token</b> — opaco (UUIDs concatenados), 7 dias. Persistido como
 *       hash SHA-256 na tabela {@code refresh_tokens}. <b>Rotaciona</b> a cada refresh:
 *       o anterior é marcado como revogado. Se um refresh já revogado for usado,
 *       revogamos toda a "árvore" do usuário (proteção contra roubo de token).</li>
 * </ul>
 *
 * <p>Rate limit aplicado no login via {@link LoginRateLimiter} para mitigar brute force.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final LoginRateLimiter rateLimiter;

    @Value("${app.security.jwt.refresh-token-ttl-days}")
    private long refreshTtlDays;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new DuplicateResourceException("Email já cadastrado");
        }
        User user = User.builder()
                .name(request.name())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.USER)
                .active(true)
                .build();
        user = userRepository.save(user);

        // cria carrinho vazio
        cartRepository.save(Cart.builder().user(user).build());

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String clientKey) {
        if (!rateLimiter.tryConsume(clientKey)) {
            throw new BusinessException("Muitas tentativas de login. Tente novamente em alguns minutos.");
        }
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));
        if (!user.isActive()) {
            throw new BusinessException("Usuário desativado");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciais inválidas");
        }
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        String hash = sha256(refreshToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new InvalidTokenException("Refresh token inválido"));

        if (!stored.isActive()) {
            // se já foi usado/revogado, revoga tudo do usuário (proteção contra reuso)
            refreshTokenRepository.revokeAllForUser(stored.getUser());
            throw new InvalidTokenException("Refresh token expirado ou revogado");
        }

        // rotação: revoga o atual, emite outro
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return issueTokens(stored.getUser());
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;
        String hash = sha256(refreshToken);
        refreshTokenRepository.findByTokenHash(hash).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    private AuthResponse issueTokens(User user) {
        String access = jwtService.generateAccessToken(user);
        String refreshRaw = UUID.randomUUID().toString() + UUID.randomUUID();
        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(sha256(refreshRaw))
                .expiresAt(Instant.now().plus(Duration.ofDays(refreshTtlDays)))
                .revoked(false)
                .build();
        refreshTokenRepository.save(rt);
        return AuthResponse.of(access, refreshRaw, jwtService.getAccessTtlSeconds(), userMapper.toResponse(user));
    }

    private String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (Exception e) {
            throw new IllegalStateException("Erro ao calcular hash", e);
        }
    }
}
