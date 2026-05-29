package com.cafeteria.api.presentation.controller;

import com.cafeteria.api.application.dto.response.DashboardStatsResponse;
import com.cafeteria.api.application.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Métricas agregadas para a tela de dashboard do admin.
 */
@Tag(name = "Admin · Dashboard")
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Métricas de vendas, top produtos e pedidos por status")
    public DashboardStatsResponse stats() {
        return dashboardService.stats();
    }
}
