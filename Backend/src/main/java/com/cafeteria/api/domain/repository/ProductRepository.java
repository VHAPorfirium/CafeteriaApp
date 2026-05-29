package com.cafeteria.api.domain.repository;

import com.cafeteria.api.domain.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositório de produtos. Inclui busca paginada com filtros opcionais
 * e fetch com lock otimista para operações concorrentes de estoque.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    /**
     * Busca paginada do catálogo público.
     * {@code categorySlug} e {@code search} são opcionais (podem vir null).
     * O CAST explícito ajuda o Hibernate 6 a inferir o tipo do parâmetro
     * quando ele chega como null na primeira chamada.
     */
    @Query("""
        SELECT p FROM Product p
        WHERE p.active = true
        AND (:categorySlug IS NULL OR LOWER(p.category.slug) = LOWER(CAST(:categorySlug AS string)))
        AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        """)
    Page<Product> search(@Param("categorySlug") String categorySlug,
                         @Param("search") String search,
                         Pageable pageable);

    /** Versão "pública" do findById que respeita soft delete. */
    Optional<Product> findByIdAndActiveTrue(UUID id);

    /**
     * Carrega o produto sob lock otimista — usado na criação de pedidos para
     * evitar oversell quando dois clientes finalizam ao mesmo tempo.
     * Se o version mudar entre o read e o update, o Hibernate lança
     * {@link org.springframework.dao.OptimisticLockingFailureException}.
     */
    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") UUID id);
}
