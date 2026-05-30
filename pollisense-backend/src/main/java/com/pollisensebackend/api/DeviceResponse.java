package com.pollisensebackend.api;

import java.time.Instant;
import java.util.Map;

import com.pollisensebackend.domain.ConnectivityStatus;
import com.pollisensebackend.domain.Device;
import com.pollisensebackend.domain.ModuleStatus;

public record DeviceResponse(
        String id,
        String stationId,
        String label,
        String status,
        Instant lastSync,
        int signalQuality,
        int batteryLevel,
        String connectivity,
        Map<String, String> modules) {

    public static DeviceResponse from(Device device) {
        String module = moduleStatus(device.getModuleStatus());
        return new DeviceResponse(
                device.getId(),
                device.getStationId(),
                device.getLabel(),
                stationStatus(device),
                device.getLastSync(),
                device.getSignalQuality(),
                device.getBatteryLevel(),
                connectivityLabel(device.getConnectivityStatus()),
                Map.of("vision", module, "environment", module, "compute", module, "power", module));
    }

    private static String stationStatus(Device device) {
        if (device.getConnectivityStatus() == ConnectivityStatus.OFFLINE || device.getModuleStatus() == ModuleStatus.OFFLINE) {
            return "offline";
        }
        if (device.getConnectivityStatus() == ConnectivityStatus.WEAK || device.getSignalQuality() < 50
                || device.getBatteryLevel() < 25 || device.getModuleStatus() != ModuleStatus.OK) {
            return "degraded";
        }
        return "online";
    }

    private static String connectivityLabel(ConnectivityStatus status) {
        return switch (status) {
            case GOOD -> "LTE-M";
            case WEAK -> "NB-IoT";
            case OFFLINE -> "offline";
        };
    }

    private static String moduleStatus(ModuleStatus status) {
        return switch (status) {
            case OK -> "ok";
            case ATTENTION -> "attention";
            case OFFLINE -> "offline";
        };
    }
}
