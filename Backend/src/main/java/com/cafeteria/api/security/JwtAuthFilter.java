package com.cafeteria.api.security;

import com.cafeteria.api.domain.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Filtro que intercepta cada request HTTP, valida o token Bearer
 * e popula o {@link org.springframework.security.core.context.SecurityContext}
 * com um {@link AuthenticatedUser} para uso nos controllers.
 *
 * <p>Roda antes do {@link org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter}
 * (registrado no {@link com.cafeteria.api.config.SecurityConfig}).
 *
 * <p>Se o token for inválido, expirado ou referenciar um usuário inativo,
 * o request prossegue sem autenticação — a chain de segurança rejeita depois.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                if (jwtService.isValid(token)) {
                    UUID userId = jwtService.extractUserId(token);
                    String role  = jwtService.extractRole(token);
                    String email = jwtService.extractEmail(token);

                    userRepository.findById(userId).ifPresent(user -> {
                        if (!user.isActive()) return;
                        var auth = new UsernamePasswordAuthenticationToken(
                                new AuthenticatedUser(user.getId(), email, user.getName(), user.getRole()),
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    });
                }
            } catch (Exception ex) {
                log.debug("Falha ao processar JWT: {}", ex.getMessage());
            }
        }
        chain.doFilter(req, res);
    }
}
