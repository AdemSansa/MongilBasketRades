package com.mongilbasket.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.mongilbasket.user.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TYPE = "type";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    private final SecretKey signingKey;
    private final long accessTokenExpirationMinutes;
    private final long refreshTokenExpirationDays;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiration-minutes}") long accessTokenExpirationMinutes,
            @Value("${app.jwt.refresh-token-expiration-days}") long refreshTokenExpirationDays) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMinutes = accessTokenExpirationMinutes;
        this.refreshTokenExpirationDays = refreshTokenExpirationDays;
    }

    public String generateAccessToken(User user) {
        return buildToken(user, Duration.ofMinutes(accessTokenExpirationMinutes), TOKEN_TYPE_ACCESS);
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, Duration.ofDays(refreshTokenExpirationDays), TOKEN_TYPE_REFRESH);
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /** Validates signature, expiry, and that the token is the expected type (access vs refresh). */
    public boolean isTokenValid(String token, String expectedType) {
        try {
            Claims claims = parseClaims(token);
            return expectedType.equals(claims.get(CLAIM_TYPE, String.class))
                    && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private String buildToken(User user, Duration ttl, String tokenType) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim(CLAIM_ROLE, user.getRole().name())
                .claim(CLAIM_TYPE, tokenType)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(ttl)))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
