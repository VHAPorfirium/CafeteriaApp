package com.cafeteria.api.security;

import com.cafeteria.api.domain.enums.UserRole;
import com.cafeteria.api.exception.InvalidTokenException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

/**
 * Representação enxuta do usuário autenticado, salva no SecurityContext.
 * Usada pelos controllers via {@link #current()} para evitar passar
 * o objeto User completo (que tem hash de senha) por aí.
 */
public record AuthenticatedUser(UUID id, String email, String name, UserRole role) {

    public static AuthenticatedUser current() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof AuthenticatedUser u)) {
            throw new InvalidTokenException("Usuário não autenticado");
        }
        return u;
    }

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }
}
