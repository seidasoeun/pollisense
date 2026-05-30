package com.pollisensebackend.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "device_health_snapshots")
public class DeviceHealthSnapshot {

    @Id
    private UUID id;

    private Instant timestamp;
    private String stationId;
    private String deviceId;
    private int batteryLevel;

    @Enumerated(EnumType.STRING)
    private ConnectivityStatus connectivityStatus;

    private int signalQuality;

    @Enumerated(EnumType.STRING)
    private ModuleStatus moduleStatus;

    protected DeviceHealthSnapshot() {
    }

    public DeviceHealthSnapshot(UUID id, Instant timestamp, String stationId, String deviceId, int batteryLevel,
            ConnectivityStatus connectivityStatus, int signalQuality, ModuleStatus moduleStatus) {
        this.id = id;
        this.timestamp = timestamp;
        this.stationId = stationId;
        this.deviceId = deviceId;
        this.batteryLevel = batteryLevel;
        this.connectivityStatus = connectivityStatus;
        this.signalQuality = signalQuality;
        this.moduleStatus = moduleStatus;
    }

    public UUID getId() {
        return id;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public String getStationId() {
        return stationId;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public int getBatteryLevel() {
        return batteryLevel;
    }

    public ConnectivityStatus getConnectivityStatus() {
        return connectivityStatus;
    }

    public int getSignalQuality() {
        return signalQuality;
    }

    public ModuleStatus getModuleStatus() {
        return moduleStatus;
    }
}
