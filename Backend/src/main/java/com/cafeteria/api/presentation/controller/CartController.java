package com.cafeteria.api.presentation.controller;

import com.cafeteria.api.application.dto.request.CartItemRequest;
import com.cafeteria.api.application.dto.request.UpdateCartItemRequest;
import com.cafeteria.api.application.dto.response.CartResponse;
import com.cafeteria.api.application.service.CartService;
import com.cafeteria.api.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * CRUD do carrinho do usuário autenticado. Cada operação retorna o
 * carrinho completo — o frontend só precisa substituir o cache, sem refetch.
 */
@Tag(name = "Carrinho")
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Carrinho do usuário autenticado")
    public CartResponse getMine() {
        return cartService.getMyCart(AuthenticatedUser.current().id());
    }

    @PostMapping("/items")
    @Operation(summary = "Adiciona item ao carrinho")
    public CartResponse addItem(@Valid @RequestBody CartItemRequest request) {
        return cartService.addItem(AuthenticatedUser.current().id(), request);
    }

    @PatchMapping("/items/{itemId}")
    @Operation(summary = "Atualiza quantidade de um item")
    public CartResponse updateItem(@PathVariable UUID itemId,
                                   @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItem(AuthenticatedUser.current().id(), itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item do carrinho")
    public CartResponse removeItem(@PathVariable UUID itemId) {
        return cartService.removeItem(AuthenticatedUser.current().id(), itemId);
    }
}
