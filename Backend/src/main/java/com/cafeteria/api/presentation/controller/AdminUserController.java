package com.cafeteria.api.presentation.controller;

import com.cafeteria.api.application.dto.response.PageResponse;
import com.cafeteria.api.application.dto.response.UserResponse;
import com.cafeteria.api.application.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Listagem paginada de usuários para o admin.
 */
@Tag(name = "Admin · Usuários")
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Lista usuários (paginado)")
    public PageResponse<UserResponse> list(@PageableDefault(size = 20) Pageable pageable) {
        return adminUserService.list(pageable);
    }
}
