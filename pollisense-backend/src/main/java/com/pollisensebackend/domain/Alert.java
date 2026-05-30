package com.pollisensebackend.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    private UUID id;

    private Instant timestamp;
    private String stationId;
    private String deviceId;

    @Enumerated(EnumType.STRING)
    private AlertSeverity severity;

    private String title;
    private String message;

    protected Alert() {
    }

    public Alert(UUID id, Instant timestamp, String stationId, String deviceId, AlertSeverity severity, String title,
            String message) {
        this.id = id;
        this.timestamp = timestamp;
        this.stationId = stationId;
        this.deviceId = deviceId;
        this.severity = severity;
        this.title = title;
        this.message = message;
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

    public AlertSeverity getSeverity() {
        return severity;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }
}
