package com.mongilbasket.common;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

/**
 * Unauthenticated keep-alive target (see SecurityConfig). Meant to be pinged externally every
 * few minutes -- Render's free tier spins the backend down after ~15 min with no inbound
 * traffic, and nothing running inside an already-sleeping process can prevent that, so the ping
 * has to come from outside. Runs a trivial query (not just returning 200) so the same ping also
 * resets Neon's separate autosuspend timer, keeping both warm together.
 */
@RestController
@RequiredArgsConstructor
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/api/health")
    public ApiResponse<String> health() {
        jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        return ApiResponse.ok("UP");
    }
}
