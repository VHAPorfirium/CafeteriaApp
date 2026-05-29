package com.cafeteria.api.presentation.controller;

import com.cafeteria.api.application.dto.request.ReviewRequest;
import com.cafeteria.api.application.dto.response.ReviewResponse;
import com.cafeteria.api.application.service.ReviewService;
import com.cafeteria.api.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Criação de avaliações (1–5 estrelas). 1 avaliação por usuário por produto.
 */
@Tag(name = "Avaliações")
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Cria avaliação de um produto (1 por usuário/produto)")
    public ResponseEntity<ReviewResponse> create(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.create(AuthenticatedUser.current().id(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
