package com.pollisensesimulator;

import java.time.Instant;

public record IngestionRecord(
        Instant timestamp,
        String stationId,
        String deviceId,
        String targetGroup,
        int pollinatorCount,
        double confidence,
        double temperature,
        double humidity,
        int lightLevel,
        int batteryLevel,
        String connectivityStatus,
        int signalQuality,
        String moduleStatus) {
}
