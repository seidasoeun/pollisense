package com.pollisensebackend.api;

import java.time.Instant;

import com.pollisensebackend.domain.ObservationRecord;

public record RecordResponse(
        String id,
        Instant timestamp,
        String stationId,
        String deviceId,
        String targetGroup,
        int insectCount,
        double confidence,
        double temperature,
        double humidity,
        int lightIntensity,
        boolean reviewed,
        boolean flagged) {

    public static RecordResponse from(ObservationRecord record) {
        return new RecordResponse(
                record.getId().toString(),
                record.getTimestamp(),
                record.getStationId(),
                record.getDeviceId(),
                record.getTargetGroup().name().toLowerCase(),
                record.getPollinatorCount(),
                record.getConfidence(),
                record.getTemperature(),
                record.getHumidity(),
                record.getLightLevel(),
                record.isReviewed(),
                record.isFlagged());
    }
}
