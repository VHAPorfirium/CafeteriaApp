package com.cafeteria.api.security;

import com.cafeteria.api.domain.entity.User;
import com.cafeteria.api.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Adapta nosso {@link com.cafeteria.api.domain.entity.User} para a interface
 * {@link UserDetails} esperada pelo Spring Security.
 *
 * <p>Carregado durante o fluxo de login pelo {@code AuthenticationManager}
 * para validar credenciais.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));
        return toUserDetails(user);
    }

    public UserDetails toUserDetails(User user) {
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                user.isActive(), true, true, true,
                List.of(new SimpleGrantedAuthority(user.getRole().authority()))
        );
    }
}
