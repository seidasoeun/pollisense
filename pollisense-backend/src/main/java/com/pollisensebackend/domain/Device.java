package com.pollisensebackend.domain;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "devices")
public class Device {

    @Id
    private String id;

    private String stationId;
    private String label;
    private Instant lastSync;
    private int signalQuality;
    private int batteryLevel;

    @Enumerated(EnumType.STRING)
    private ConnectivityStatus connectivityStatus;

    @Enumerated(EnumType.STRING)
    private ModuleStatus moduleStatus;

    protected Device() {
    }

    public Device(String id, String stationId, String label, int signalQuality, int batteryLevel,
            ConnectivityStatus connectivityStatus, ModuleStatus moduleStatus) {
        this.id = id;
        this.stationId = stationId;
        this.label = label;
        this.signalQuality = signalQuality;
        this.batteryLevel = batteryLevel;
        this.connectivityStatus = connectivityStatus;
        this.moduleStatus = moduleStatus;
        this.lastSync = Instant.now();
    }

    public void applyHealth(int batteryLevel, ConnectivityStatus connectivityStatus, int signalQuality,
            ModuleStatus moduleStatus, Instant lastSync) {
        this.batteryLevel = batteryLevel;
        this.connectivityStatus = connectivityStatus;
        this.signalQuality = signalQuality;
        this.moduleStatus = moduleStatus;
        this.lastSync = lastSync;
    }

    public String getId() {
        return id;
    }

    public String getStationId() {
        return stationId;
    }

    public String getLabel() {
        return label;
    }

    public Instant getLastSync() {
        return lastSync;
    }

    public int getSignalQuality() {
        return signalQuality;
    }

    public int getBatteryLevel() {
        return batteryLevel;
    }

    public ConnectivityStatus getConnectivityStatus() {
        return connectivityStatus;
    }

    public ModuleStatus getModuleStatus() {
        return moduleStatus;
    }
}
