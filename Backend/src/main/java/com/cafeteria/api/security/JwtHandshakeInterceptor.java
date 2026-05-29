package com.cafeteria.api.security;

import com.cafeteria.api.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

/**
 * Intercepta o handshake WebSocket (HTTP upgrade para WS) e valida o JWT.
 *
 * <p>O navegador não pode setar header {@code Authorization} ao abrir um
 * WebSocket — por isso o token vem na query string ({@code ?token=...}).
 *
 * <p>Quando autenticado, o {@link AuthenticatedUser} é salvo nos attributes
 * da sessão WS e um {@link java.security.Principal} é injetado para que o
 * {@code SimpMessagingTemplate.convertAndSendToUser()} consiga rotear
 * mensagens privadas via {@code /user/queue/...}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String token = extractToken(request);
        if (token == null) {
            log.debug("WS handshake sem token, aceitando como anônimo");
            return true;
        }
        try {
            if (!jwtService.isValid(token)) return false;
            UUID userId = jwtService.extractUserId(token);
            return userRepository.findById(userId).map(user -> {
                if (!user.isActive()) return false;
                attributes.put("user", new AuthenticatedUser(
                        user.getId(), user.getEmail(), user.getName(), user.getRole()));
                attributes.put("principal", (Principal) user.getId()::toString);
                return true;
            }).orElse(false);
        } catch (Exception e) {
            log.debug("Falha no handshake JWT: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }

    private String extractToken(ServerHttpRequest request) {
        if (request instanceof ServletServerHttpRequest servlet) {
            String token = servlet.getServletRequest().getParameter("token");
            if (token != null && !token.isBlank()) return token;
            String header = servlet.getServletRequest().getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) return header.substring(7);
        }
        return null;
    }
}
