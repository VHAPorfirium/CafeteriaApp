package com.cafeteria.api.application.service;

import com.cafeteria.api.application.dto.response.FavoriteResponse;
import com.cafeteria.api.application.mapper.FavoriteMapper;
import com.cafeteria.api.domain.entity.Favorite;
import com.cafeteria.api.domain.entity.Product;
import com.cafeteria.api.domain.entity.User;
import com.cafeteria.api.domain.repository.FavoriteRepository;
import com.cafeteria.api.domain.repository.ProductRepository;
import com.cafeteria.api.domain.repository.UserRepository;
import com.cafeteria.api.exception.DuplicateResourceException;
import com.cafeteria.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Wishlist do usuário. Constraint UNIQUE (user_id, product_id) no banco
 * já protege contra duplicidade — aqui a verificação acontece antes do save
 * só para devolver mensagem amigável.
 */
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final FavoriteMapper favoriteMapper;

    @Transactional(readOnly = true)
    public List<FavoriteResponse> listMine(UUID userId) {
        return favoriteRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(favoriteMapper::toResponse)
                .toList();
    }

    @Transactional
    public FavoriteResponse add(UUID userId, UUID productId) {
        if (favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new DuplicateResourceException("Produto já favoritado");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", userId));
        Product product = productRepository.findByIdAndActiveTrue(productId)
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", productId));
        Favorite saved = favoriteRepository.save(Favorite.builder()
                .user(user).product(product).build());
        return favoriteMapper.toResponse(saved);
    }

    @Transactional
    public void remove(UUID userId, UUID productId) {
        if (!favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            throw ResourceNotFoundException.of("Favorito", productId);
        }
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
    }
}
