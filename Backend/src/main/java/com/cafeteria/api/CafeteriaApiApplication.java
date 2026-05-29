package com.cafeteria.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada da aplicação Spring Boot.
 *
 * <p>Anotações chave:
 * <ul>
 *   <li>{@code @SpringBootApplication} — habilita auto-config, scan de componentes
 *       (a partir desse package) e configura o Spring Boot.</li>
 * </ul>
 *
 * <p>Configurações relacionadas:
 * <ul>
 *   <li>{@link com.cafeteria.api.config.SecurityConfig} — Spring Security + JWT</li>
 *   <li>{@link com.cafeteria.api.config.WebSocketConfig} — STOMP em /ws</li>
 *   <li>{@link com.cafeteria.api.config.JpaAuditingConfig} — auditoria automática</li>
 *   <li>{@link com.cafeteria.api.config.OpenApiConfig} — Swagger em /swagger-ui.html</li>
 * </ul>
 */
@SpringBootApplication
public class CafeteriaApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CafeteriaApiApplication.class, args);
    }
}
