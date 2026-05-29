package com.cafeteria.api.presentation.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.Instant;
import java.util.Map;

/**
 * STOMP endpoints simples. O grosso dos eventos é publicado via
 * SimpMessagingTemplate diretamente nos services.
 *
 * Tópicos / filas:
 *  - /topic/admin/orders          → novos pedidos (admin)
 *  - /topic/products/stock        → broadcast de mudança de estoque
 *  - /user/queue/order-updates    → fila privada por usuário (status de pedido)
 *  - /user/queue/notifications    → fila privada de notificações
 */
@Slf4j
@Controller
public class OrderEventsController {

    /** Cliente pode enviar /app/ping e recebe broadcast em /topic/ping (healthcheck WS). */
    @MessageMapping("/ping")
    @SendTo("/topic/ping")
    public Map<String, Object> ping() {
        return Map.of("pong", true, "timestamp", Instant.now().toString());
    }
}
