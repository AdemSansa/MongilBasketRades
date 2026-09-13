package com.mongilbasket.settings;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppSettingsService {

    private static final BigDecimal DEFAULT_MEMBERSHIP_FEE = new BigDecimal("50.00");
    private static final BigDecimal DEFAULT_INSURANCE_FEE = new BigDecimal("60.00");

    private final AppSettingsRepository settingsRepository;

    @Transactional
    public SettingsResponse get() {
        return SettingsResponse.from(getOrCreate());
    }

    @Transactional
    public SettingsResponse update(SettingsUpdateRequest request) {
        AppSettings settings = getOrCreate();
        settings.setMembershipFeeMonthly(request.membershipFeeMonthly());
        settings.setInsuranceFeeYearly(request.insuranceFeeYearly());
        return SettingsResponse.from(settings);
    }

    private AppSettings getOrCreate() {
        return settingsRepository.findById(1).orElseGet(() -> settingsRepository.save(AppSettings.builder()
                .id(1)
                .membershipFeeMonthly(DEFAULT_MEMBERSHIP_FEE)
                .insuranceFeeYearly(DEFAULT_INSURANCE_FEE)
                .build()));
    }
}
