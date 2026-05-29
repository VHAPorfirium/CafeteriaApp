package com.cafeteria.api.presentation.controller;

import com.cafeteria.api.application.dto.request.LoginRequest;
import com.cafeteria.api.application.dto.request.RefreshTokenRequest;
import com.cafeteria.api.application.dto.request.RegisterRequest;
import com.cafeteria.api.application.dto.response.AuthResponse;
import com.cafeteria.api.application.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints públicos de autenticação: registro, login, refresh e logout.
 * O refresh aplica rotação — usar um token revogado revoga todos os outros do usuário.
 */
@Tag(name = "Autenticação", description = "Registro, login, refresh e logout")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Registra um novo usuário")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login e emissão de tokens")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        String key = http.getRemoteAddr() + ":" + request.email();
        return authService.login(request, key);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotaciona o refresh token e gera novo access token")
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @PostMapping("/logout")
    @Operation(summary = "Revoga o refresh token")
    public ResponseEntity<Void> logout(@RequestBody(required = false) RefreshTokenRequest request) {
        authService.logout(request == null ? null : request.refreshToken());
        return ResponseEntity.noContent().build();
    }
}
