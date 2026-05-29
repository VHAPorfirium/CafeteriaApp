package com.cafeteria.api.service;

import com.cafeteria.api.application.dto.request.LoginRequest;
import com.cafeteria.api.application.dto.request.RegisterRequest;
import com.cafeteria.api.application.dto.response.AuthResponse;
import com.cafeteria.api.application.dto.response.UserResponse;
import com.cafeteria.api.application.mapper.UserMapper;
import com.cafeteria.api.application.service.AuthService;
import com.cafeteria.api.config.RateLimitConfig.LoginRateLimiter;
import com.cafeteria.api.domain.entity.Cart;
import com.cafeteria.api.domain.entity.User;
import com.cafeteria.api.domain.enums.UserRole;
import com.cafeteria.api.domain.repository.CartRepository;
import com.cafeteria.api.domain.repository.RefreshTokenRepository;
import com.cafeteria.api.domain.repository.UserRepository;
import com.cafeteria.api.exception.DuplicateResourceException;
import com.cafeteria.api.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock CartRepository cartRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock UserMapper userMapper;
    @Mock LoginRateLimiter rateLimiter;

    @InjectMocks AuthService authService;

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(authService, "refreshTtlDays", 7L);
    }

    @Test
    void register_deveCriarUsuarioECarrinhoEEmitirTokens() {
        when(userRepository.existsByEmailIgnoreCase("a@b.com")).thenReturn(false);
        when(passwordEncoder.encode("Senha@123")).thenReturn("hash");
        User saved = User.builder().id(UUID.randomUUID()).name("A").email("a@b.com")
                .passwordHash("hash").role(UserRole.USER).active(true).build();
        when(userRepository.save(any())).thenReturn(saved);
        when(jwtService.generateAccessToken(saved)).thenReturn("access");
        when(jwtService.getAccessTtlSeconds()).thenReturn(900L);
        when(userMapper.toResponse(saved)).thenReturn(new UserResponse(saved.getId(), "A", "a@b.com",
                UserRole.USER, true, Instant.now()));

        AuthResponse response = authService.register(new RegisterRequest("A", "a@b.com", "Senha@123"));

        assertThat(response.accessToken()).isEqualTo("access");
        assertThat(response.refreshToken()).isNotBlank();
        verify(cartRepository).save(any(Cart.class));
    }

    @Test
    void register_deveLancarSeEmailJaExiste() {
        when(userRepository.existsByEmailIgnoreCase("dup@b.com")).thenReturn(true);
        assertThatThrownBy(() -> authService.register(new RegisterRequest("X", "dup@b.com", "Senha@123")))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void login_deveLancarSeRateLimitExcedido() {
        when(rateLimiter.tryConsume("k")).thenReturn(false);
        assertThatThrownBy(() ->
                authService.login(new LoginRequest("a@b.com", "x"), "k"))
                .hasMessageContaining("Muitas tentativas");
    }

    @Test
    void login_deveLancarBadCredentialsSeUsuarioNaoExiste() {
        when(rateLimiter.tryConsume("k")).thenReturn(true);
        when(userRepository.findByEmailIgnoreCase("nope@b.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() ->
                authService.login(new LoginRequest("nope@b.com", "x"), "k"))
                .isInstanceOf(BadCredentialsException.class);
    }
}
