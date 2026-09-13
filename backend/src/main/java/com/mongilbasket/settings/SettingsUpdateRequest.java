package com.mongilbasket.settings;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record SettingsUpdateRequest(
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal membershipFeeMonthly,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal insuranceFeeYearly) {}
