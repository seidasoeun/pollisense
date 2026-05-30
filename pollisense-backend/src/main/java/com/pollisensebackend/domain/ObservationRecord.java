package com.pollisensebackend.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "observation_records")
public class ObservationRecord {

    @Id
    private UUID id;

    private Instant timestamp;
    private String stationId;
    private String deviceId;

    @Enumerated(EnumType.STRING)
    private TargetGroup targetGroup;

    private int pollinatorCount;
    private double confidence;
    private double temperature;
    private double humidity;
    private int lightLevel;
    private int batteryLevel;

    @Enumerated(EnumType.STRING)
    private ConnectivityStatus connectivityStatus;

    private int signalQuality;

    @Enumerated(EnumType.STRING)
    private ModuleStatus moduleStatus;

    private boolean reviewed;
    private boolean flagged;

    protected ObservationRecord() {
    }

    public ObservationRecord(UUID id, Instant timestamp, String stationId, String deviceId, TargetGroup targetGroup,
            int pollinatorCount, double confidence, double temperature, double humidity, int lightLevel,
            int batteryLevel, ConnectivityStatus connectivityStatus, int signalQuality, ModuleStatus moduleStatus) {
        this.id = id;
        this.timestamp = timestamp;
        this.stationId = stationId;
        this.deviceId = deviceId;
        this.targetGroup = targetGroup;
        this.pollinatorCount = pollinatorCount;
        this.confidence = confidence;
        this.temperature = temperature;
        this.humidity = humidity;
        this.lightLevel = lightLevel;
        this.batteryLevel = batteryLevel;
        this.connectivityStatus = connectivityStatus;
        this.signalQuality = signalQuality;
        this.moduleStatus = moduleStatus;
        this.reviewed = confidence >= 0.7;
        this.flagged = confidence < 0.65 || connectivityStatus != ConnectivityStatus.GOOD || moduleStatus != ModuleStatus.OK;
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

    public TargetGroup getTargetGroup() {
        return targetGroup;
    }

    public int getPollinatorCount() {
        return pollinatorCount;
    }

    public double getConfidence() {
        return confidence;
    }

    public double getTemperature() {
        return temperature;
    }

    public double getHumidity() {
        return humidity;
    }

    public int getLightLevel() {
        return lightLevel;
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

    public boolean isReviewed() {
        return reviewed;
    }

    public boolean isFlagged() {
        return flagged;
    }
}
