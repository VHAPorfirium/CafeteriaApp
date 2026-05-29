package com.cafeteria.api.presentation.controller;

import com.cafeteria.api.application.dto.request.UpdateOrderStatusRequest;
import com.cafeteria.api.application.dto.response.OrderResponse;
import com.cafeteria.api.application.dto.response.PageResponse;
import com.cafeteria.api.application.service.OrderService;
import com.cafeteria.api.domain.enums.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Operação dos pedidos pelo admin. PATCH de status segue a máquina de
 * estados definida em {@link com.cafeteria.api.domain.enums.OrderStatus}.
 * Novos pedidos chegam em tempo real via {@code /topic/admin/orders}.
 */
@Tag(name = "Admin · Pedidos")
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    @Operation(summary = "Lista pedidos (paginado, filtro por status)")
    public PageResponse<OrderResponse> list(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return orderService.adminList(status, pageable);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualiza status do pedido")
    public OrderResponse updateStatus(@PathVariable UUID id,
                                      @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateStatus(id, request);
    }
}
