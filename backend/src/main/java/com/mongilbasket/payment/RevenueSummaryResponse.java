package com.mongilbasket.payment;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Sum of PAID payments and kit orders (by paymentDate, the date money actually came in) within an optional [from, to] range. */
public record RevenueSummaryResponse(
        LocalDate from,
        LocalDate to,
        BigDecimal total,
        BigDecimal membershipTotal,
        BigDecimal insuranceTotal,
        BigDecimal kitTotal,
        int paymentCount) {}
