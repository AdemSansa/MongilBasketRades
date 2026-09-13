package com.mongilbasket.payment;

import java.util.List;

public record MonthlyPaymentStatusResponse(int year, int month, String period, List<PlayerPaymentStatusRow> rows) {}
