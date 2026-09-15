package com.mongilbasket.kit;

import java.math.BigDecimal;

/** Sum of PAID kit orders within a date range -- see KitOrderService.revenue and PaymentService.revenueSummary. */
public record KitRevenue(BigDecimal total, int count) {}
