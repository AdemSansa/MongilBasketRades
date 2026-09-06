package com.mongilbasket.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mongilbasket.common.ConflictException;
import com.mongilbasket.common.NotFoundException;
import com.mongilbasket.common.UnauthorizedException;
import com.mongilbasket.security.JwtService;
import com.mongilbasket.user.Role;
import com.mongilbasket.user.User;
import com.mongilbasket.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String REFRESH_TOKEN_TYPE = "refresh";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        return buildAuthResponse(user);
    }

    /**
     * Creates a PARENT-role User only. The corresponding Parent profile
     * entity (address, linked children) is built in Phase 4 — see
     * docs/database/entities.md.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.PARENT)
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .build();
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtService.isTokenValid(refreshToken, REFRESH_TOKEN_TYPE)) {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }
        String email = jwtService.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));
        return buildAuthResponse(user);
    }

    public UserResponse me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return UserResponse.from(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken(user);
        return new AuthResponse(accessToken, refreshTokenValue, UserResponse.from(user));
    }
}
