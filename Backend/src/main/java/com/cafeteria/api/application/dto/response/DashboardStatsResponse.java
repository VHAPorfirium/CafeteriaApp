package com.cafeteria.api.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DashboardStatsResponse(
        BigDecimal totalRevenueMonth,
        BigDecimal totalRevenueLast7Days,
        long totalOrders,
        List<RevenuePerDay> revenueLast7Days,
        List<TopProduct> topProducts,
        List<OrdersByStatus> ordersByStatus
) {
    public record RevenuePerDay(LocalDate day, BigDecimal revenue) {}
    public record TopProduct(UUID productId, String productName, long quantity, BigDecimal revenue) {}
    public record OrdersByStatus(String status, long count) {}
}
