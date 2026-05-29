package com.cafeteria.api.presentation.controller;

import com.cafeteria.api.application.dto.request.ProductRequest;
import com.cafeteria.api.application.dto.response.ProductResponse;
import com.cafeteria.api.application.dto.response.UploadImageResponse;
import com.cafeteria.api.application.service.ImageStorageService;
import com.cafeteria.api.application.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * CRUD de produtos (admin). {@code DELETE} é soft delete (active=false)
 * para preservar histórico de pedidos. Upload de imagem vai para o MinIO.
 */
@Tag(name = "Admin · Produtos")
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;
    private final ImageStorageService imageStorageService;

    @PostMapping
    @Operation(summary = "Cria produto")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza produto")
    public ProductResponse update(@PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete do produto")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload de imagem do produto (multipart)")
    public ResponseEntity<UploadImageResponse> uploadImage(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "primary", defaultValue = "false") boolean primary) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imageStorageService.uploadProductImage(id, file, primary));
    }
}
