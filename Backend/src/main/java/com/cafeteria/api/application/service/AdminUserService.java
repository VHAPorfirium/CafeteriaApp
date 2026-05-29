package com.cafeteria.api.application.service;

import com.cafeteria.api.application.dto.response.PageResponse;
import com.cafeteria.api.application.dto.response.UserResponse;
import com.cafeteria.api.application.mapper.UserMapper;
import com.cafeteria.api.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Listagem paginada de usuários — utilizada apenas pela rota de admin.
 */
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> list(Pageable pageable) {
        return PageResponse.from(userRepository.findAll(pageable), userMapper::toResponse);
    }
}
