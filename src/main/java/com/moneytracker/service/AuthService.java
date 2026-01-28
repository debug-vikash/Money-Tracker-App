package com.moneytracker.service;

import com.moneytracker.dto.AuthResponse;
import com.moneytracker.dto.LoginRequest;
import com.moneytracker.dto.RegisterRequest;
import com.moneytracker.exception.BadRequestException;
import com.moneytracker.model.Role;
import com.moneytracker.model.User;
import com.moneytracker.repository.RoleRepository;
import com.moneytracker.repository.UserRepository;
import com.moneytracker.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Role userRole = roleRepository.findByName(Role.ROLE_USER)
                .orElseGet(() -> roleRepository.save(Role.builder().name(Role.ROLE_USER).build()));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(userRole)
                .build();

        user = userRepository.save(user);

        String token = jwtUtils.generateTokenFromUsername(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        User user = (User) authentication.getPrincipal();
        String token = jwtUtils.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().getName())
                .build();
    }
}
