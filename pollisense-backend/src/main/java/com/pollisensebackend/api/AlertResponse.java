package com.pollisensebackend.api;

import java.time.Instant;

import com.pollisensebackend.domain.Alert;

public record AlertResponse(
        String id,
        Instant timestamp,
        String stationId,
        String deviceId,
        String severity,
        String title,
        String message) {

    public static AlertResponse from(Alert alert) {
        return new AlertResponse(
                alert.getId().toString(),
                alert.getTimestamp(),
                alert.getStationId(),
                alert.getDeviceId(),
                alert.getSeverity().name().toLowerCase(),
                alert.getTitle(),
                alert.getMessage());
    }
}
