package com.pollisensebackend.api;

import java.time.Instant;

import com.pollisensebackend.domain.ConnectivityStatus;
import com.pollisensebackend.domain.ModuleStatus;
import com.pollisensebackend.domain.TargetGroup;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record IngestionRecordRequest(
        @NotNull Instant timestamp,
        @NotBlank String stationId,
        @NotBlank String deviceId,
        @NotNull TargetGroup targetGroup,
        @Min(0) int pollinatorCount,
        @DecimalMin("0.0") @DecimalMax("1.0") double confidence,
        double temperature,
        @DecimalMin("0.0") @DecimalMax("100.0") double humidity,
        @Min(0) int lightLevel,
        @Min(0) @Max(100) int batteryLevel,
        @NotNull ConnectivityStatus connectivityStatus,
        @Min(0) @Max(100) int signalQuality,
        @NotNull ModuleStatus moduleStatus) {
}
