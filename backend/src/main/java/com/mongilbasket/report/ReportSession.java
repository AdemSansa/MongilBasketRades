package com.mongilbasket.report;

import java.time.LocalDate;
import java.util.UUID;

public record ReportSession(UUID id, LocalDate date) {
}
