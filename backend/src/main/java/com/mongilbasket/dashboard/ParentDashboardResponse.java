package com.mongilbasket.dashboard;

import java.util.List;

public record ParentDashboardResponse(List<ChildDashboardSummary> children) {
}
