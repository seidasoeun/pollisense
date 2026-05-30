package com.pollisensebackend.api;

import java.time.Instant;

import com.pollisensebackend.domain.DeviceHealthSnapshot;

public record DeviceHealthResponse(
        String id,
        Instant timestamp,
        String stationId,
        String deviceId,
        int batteryLevel,
        String connectivityStatus,
        int signalQuality,
        String moduleStatus) {

    public static DeviceHealthResponse from(DeviceHealthSnapshot snapshot) {
        return new DeviceHealthResponse(
                snapshot.getId().toString(),
                snapshot.getTimestamp(),
                snapshot.getStationId(),
                snapshot.getDeviceId(),
                snapshot.getBatteryLevel(),
                snapshot.getConnectivityStatus().name(),
                snapshot.getSignalQuality(),
                snapshot.getModuleStatus().name());
    }
}
