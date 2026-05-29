package com.cafeteria.api.presentation.controller;

import com.cafeteria.api.application.dto.request.CreateOrderRequest;
import com.cafeteria.api.application.dto.response.OrderResponse;
import com.cafeteria.api.application.dto.response.PageResponse;
import com.cafeteria.api.application.service.OrderService;
import com.cafeteria.api.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Pedidos do cliente. {@code POST /api/orders} aceita header opcional
 * {@code Idempotency-Key} para evitar duplicação em double-click.
 */
@Tag(name = "Pedidos")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Cria pedido a partir do carrinho atual")
    public ResponseEntity<OrderResponse> create(
            @Valid @RequestBody CreateOrderRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        OrderResponse order = orderService.create(
                AuthenticatedUser.current().id(), request, idempotencyKey);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/me")
    @Operation(summary = "Histórico do usuário")
    public PageResponse<OrderResponse> myOrders(@PageableDefault(size = 10) Pageable pageable) {
        return orderService.myOrders(AuthenticatedUser.current().id(), pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhe do pedido (dono ou admin)")
    public OrderResponse getById(@PathVariable UUID id) {
        return orderService.getById(id, AuthenticatedUser.current());
    }
}
