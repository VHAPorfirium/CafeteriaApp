package com.cafeteria.api.presentation.controller;

import com.cafeteria.api.application.dto.response.FavoriteResponse;
import com.cafeteria.api.application.service.FavoriteService;
import com.cafeteria.api.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Wishlist do usuário. UNIQUE (user_id, product_id) garante 1 favorito por par.
 */
@Tag(name = "Favoritos")
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    @Operation(summary = "Lista favoritos do usuário")
    public List<FavoriteResponse> list() {
        return favoriteService.listMine(AuthenticatedUser.current().id());
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Favorita um produto")
    public ResponseEntity<FavoriteResponse> add(@PathVariable UUID productId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(favoriteService.add(AuthenticatedUser.current().id(), productId));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Desfavorita um produto")
    public ResponseEntity<Void> remove(@PathVariable UUID productId) {
        favoriteService.remove(AuthenticatedUser.current().id(), productId);
        return ResponseEntity.noContent().build();
    }
}
