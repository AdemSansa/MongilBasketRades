package com.mongilbasket.settings;

import java.math.BigDecimal;
import java.time.Instant;

public record SettingsResponse(BigDecimal membershipFeeMonthly, BigDecimal insuranceFeeYearly, Instant updatedAt) {

    public static SettingsResponse from(AppSettings settings) {
        return new SettingsResponse(
                settings.getMembershipFeeMonthly(), settings.getInsuranceFeeYearly(), settings.getUpdatedAt());
    }
}
