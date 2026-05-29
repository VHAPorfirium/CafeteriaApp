package com.cafeteria.api.application.service;

import com.cafeteria.api.application.dto.response.DashboardStatsResponse;
import com.cafeteria.api.application.dto.response.DashboardStatsResponse.OrdersByStatus;
import com.cafeteria.api.application.dto.response.DashboardStatsResponse.RevenuePerDay;
import com.cafeteria.api.application.dto.response.DashboardStatsResponse.TopProduct;
import com.cafeteria.api.domain.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * Métricas agregadas para o dashboard do admin.
 *
 * <p>Soma de receita por dia (últimos 7d), top produtos, distribuição de
 * pedidos por status e totais do mês. As queries pesadas estão em
 * {@link com.cafeteria.api.domain.repository.OrderRepository}.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse stats() {
        Instant last7 = Instant.now().minus(7, ChronoUnit.DAYS);
        Instant last30 = Instant.now().minus(30, ChronoUnit.DAYS);

        List<RevenuePerDay> revenueByDay = orderRepository.revenueByDaySince(last7).stream()
                .map(r -> new RevenuePerDay(toLocalDate(r[0]), (BigDecimal) r[1]))
                .toList();

        List<TopProduct> topProducts = orderRepository.topProducts(PageRequest.of(0, 5)).stream()
                .map(r -> new TopProduct(
                        (UUID) r[0],
                        (String) r[1],
                        ((Number) r[2]).longValue(),
                        (BigDecimal) r[3]))
                .toList();

        List<OrdersByStatus> ordersByStatus = orderRepository.countByStatus().stream()
                .map(r -> new OrdersByStatus(r[0].toString(), ((Number) r[1]).longValue()))
                .toList();

        BigDecimal revenueMonth = orderRepository.totalRevenueSince(last30);
        BigDecimal revenue7 = orderRepository.totalRevenueSince(last7);
        long totalOrders = ordersByStatus.stream().mapToLong(OrdersByStatus::count).sum();

        return new DashboardStatsResponse(revenueMonth, revenue7, totalOrders,
                revenueByDay, topProducts, ordersByStatus);
    }

    private LocalDate toLocalDate(Object raw) {
        if (raw instanceof LocalDate ld) return ld;
        if (raw instanceof Date d) return d.toLocalDate();
        return LocalDate.parse(raw.toString());
    }
}
