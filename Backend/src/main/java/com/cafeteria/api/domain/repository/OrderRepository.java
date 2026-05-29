package com.cafeteria.api.domain.repository;

import com.cafeteria.api.domain.entity.Order;
import com.cafeteria.api.domain.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositório de pedidos. Concentra todas as queries de leitura do dashboard
 * (receita por dia, top produtos, distribuição por status) e o lookup por
 * {@code idempotencyKey} usado no checkout.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByUserId(UUID userId, Pageable pageable);

    Optional<Order> findByIdempotencyKey(String idempotencyKey);

    @Query("""
        SELECT o FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
        """)
    Page<Order> searchAdmin(@Param("status") OrderStatus status, Pageable pageable);

    @Query("""
        SELECT FUNCTION('DATE', o.createdAt) AS day, COALESCE(SUM(o.total),0) AS revenue
        FROM Order o
        WHERE o.createdAt >= :since AND o.status <> 'CANCELLED'
        GROUP BY FUNCTION('DATE', o.createdAt)
        ORDER BY day
        """)
    List<Object[]> revenueByDaySince(@Param("since") Instant since);

    @Query("""
        SELECT oi.product.id AS productId, oi.productName AS productName,
               SUM(oi.quantity) AS totalQty, SUM(oi.subtotal) AS totalRevenue
        FROM OrderItem oi
        WHERE oi.order.status <> 'CANCELLED'
        GROUP BY oi.product.id, oi.productName
        ORDER BY SUM(oi.quantity) DESC
        """)
    List<Object[]> topProducts(Pageable pageable);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countByStatus();

    @Query("""
        SELECT COALESCE(SUM(o.total),0) FROM Order o
        WHERE o.createdAt >= :since AND o.status <> 'CANCELLED'
        """)
    BigDecimal totalRevenueSince(@Param("since") Instant since);
}
