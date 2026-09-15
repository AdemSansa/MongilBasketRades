package com.mongilbasket.settings;

import java.math.BigDecimal;
import java.time.Instant;

public record SettingsResponse(
        BigDecimal membershipFeeMonthly, BigDecimal insuranceFeeYearly, BigDecimal kitFee, Instant updatedAt) {

    public static SettingsResponse from(AppSettings settings) {
        return new SettingsResponse(
                settings.getMembershipFeeMonthly(),
                settings.getInsuranceFeeYearly(),
                settings.getKitFee(),
                settings.getUpdatedAt());
    }
}
