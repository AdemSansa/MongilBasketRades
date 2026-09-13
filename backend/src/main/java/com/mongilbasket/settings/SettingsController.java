package com.mongilbasket.settings;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mongilbasket.common.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SettingsController {

    private final AppSettingsService settingsService;

    @GetMapping
    public ApiResponse<SettingsResponse> get() {
        return ApiResponse.ok(settingsService.get());
    }

    @PutMapping
    public ApiResponse<SettingsResponse> update(@Valid @RequestBody SettingsUpdateRequest request) {
        return ApiResponse.ok(settingsService.update(request));
    }
}
