package com.cafeteria.api.application.service;

import com.cafeteria.api.application.dto.request.ReviewRequest;
import com.cafeteria.api.application.dto.response.PageResponse;
import com.cafeteria.api.application.dto.response.ReviewResponse;
import com.cafeteria.api.application.mapper.ReviewMapper;
import com.cafeteria.api.domain.entity.Product;
import com.cafeteria.api.domain.entity.Review;
import com.cafeteria.api.domain.entity.User;
import com.cafeteria.api.domain.repository.ProductRepository;
import com.cafeteria.api.domain.repository.ReviewRepository;
import com.cafeteria.api.domain.repository.UserRepository;
import com.cafeteria.api.exception.DuplicateResourceException;
import com.cafeteria.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Avaliações (1–5 estrelas) de produtos. Cada usuário pode avaliar cada produto
 * uma única vez — constraint UNIQUE no banco impede duplicatas; aqui validamos
 * antes do insert para retornar 409 com mensagem amigável.
 */
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewMapper reviewMapper;

    @Transactional
    public ReviewResponse create(UUID userId, ReviewRequest request) {
        if (reviewRepository.existsByUserIdAndProductId(userId, request.productId())) {
            throw new DuplicateResourceException("Você já avaliou esse produto");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("Usuário", userId));
        Product product = productRepository.findByIdAndActiveTrue(request.productId())
                .orElseThrow(() -> ResourceNotFoundException.of("Produto", request.productId()));
        Review saved = reviewRepository.save(Review.builder()
                .user(user)
                .product(product)
                .rating(request.rating())
                .comment(request.comment())
                .build());
        return reviewMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> listByProduct(UUID productId, Pageable pageable) {
        return PageResponse.from(
                reviewRepository.findByProductId(productId, pageable),
                reviewMapper::toResponse);
    }
}
