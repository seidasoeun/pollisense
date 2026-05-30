package com.pollisensebackend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pollisensebackend.api.IngestionRecordRequest;
import com.pollisensebackend.domain.Alert;
import com.pollisensebackend.domain.AlertSeverity;
import com.pollisensebackend.domain.ConnectivityStatus;
import com.pollisensebackend.domain.DeviceHealthSnapshot;
import com.pollisensebackend.domain.ModuleStatus;
import com.pollisensebackend.domain.ObservationRecord;
import com.pollisensebackend.repository.AlertRepository;
import com.pollisensebackend.repository.DeviceHealthSnapshotRepository;
import com.pollisensebackend.repository.DeviceRepository;
import com.pollisensebackend.repository.ObservationRecordRepository;

@Service
public class IngestionService {

    private final ObservationRecordRepository records;
    private final DeviceRepository devices;
    private final DeviceHealthSnapshotRepository healthSnapshots;
    private final AlertRepository alerts;

    public IngestionService(ObservationRecordRepository records, DeviceRepository devices,
            DeviceHealthSnapshotRepository healthSnapshots, AlertRepository alerts) {
        this.records = records;
        this.devices = devices;
        this.healthSnapshots = healthSnapshots;
        this.alerts = alerts;
    }

    @Transactional
    public ObservationRecord ingest(IngestionRecordRequest request) {
        ObservationRecord record = new ObservationRecord(
                UUID.randomUUID(),
                request.timestamp(),
                request.stationId(),
                request.deviceId(),
                request.targetGroup(),
                request.pollinatorCount(),
                request.confidence(),
                request.temperature(),
                request.humidity(),
                request.lightLevel(),
                request.batteryLevel(),
                request.connectivityStatus(),
                request.signalQuality(),
                request.moduleStatus());

        devices.findById(request.deviceId()).ifPresent(device -> {
            device.applyHealth(request.batteryLevel(), request.connectivityStatus(), request.signalQuality(),
                    request.moduleStatus(), request.timestamp());
            devices.save(device);
        });
        healthSnapshots.save(new DeviceHealthSnapshot(
                UUID.randomUUID(),
                request.timestamp(),
                request.stationId(),
                request.deviceId(),
                request.batteryLevel(),
                request.connectivityStatus(),
                request.signalQuality(),
                request.moduleStatus()));

        ObservationRecord saved = records.save(record);
        alerts.saveAll(alertsFor(saved));
        return saved;
    }

    private List<Alert> alertsFor(ObservationRecord record) {
        List<Alert> generated = new ArrayList<>();
        if (record.getBatteryLevel() < 20) {
            generated.add(alert(record, AlertSeverity.CRITICAL, "Low battery",
                    "Battery level is below 20%, so the station may stop reporting soon."));
        }
        if (record.getConnectivityStatus() == ConnectivityStatus.WEAK || record.getConnectivityStatus() == ConnectivityStatus.OFFLINE) {
            generated.add(alert(record, record.getConnectivityStatus() == ConnectivityStatus.OFFLINE ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
                    "Connectivity degraded", "Connectivity status is " + record.getConnectivityStatus().name() + "."));
        }
        if (record.getSignalQuality() < 30) {
            generated.add(alert(record, AlertSeverity.WARNING, "Weak signal",
                    "Signal quality is below 30%, which can interrupt backend ingestion."));
        }
        if (record.getModuleStatus() != ModuleStatus.OK) {
            generated.add(alert(record, AlertSeverity.WARNING, "Module attention required",
                    "Module status is " + record.getModuleStatus().name() + "."));
        }
        return generated;
    }

    private Alert alert(ObservationRecord record, AlertSeverity severity, String title, String message) {
        return new Alert(UUID.randomUUID(), record.getTimestamp(), record.getStationId(), record.getDeviceId(), severity, title, message);
    }
}
