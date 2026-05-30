package com.pollisensebackend.api;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record DashboardPreferencesRequest(
        @NotEmpty List<String> targetGroups,
        @NotEmpty List<String> visibleWidgets,
        @NotBlank String defaultStationId,
        @NotBlank String dateRange,
        @NotBlank String layoutMode,
        @Valid @NotNull AlertThresholds alertThresholds) {

    public record AlertThresholds(
            @DecimalMin("0.0") @DecimalMax("1.0") double minConfidence,
            @Min(0) int lowBattery,
            @Min(0) int offlineHours,
            @Min(0) int activityDropPercent) {
    }
}
