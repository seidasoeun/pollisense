package com.pollisensebackend.api;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pollisensebackend.config.PolliSenseProperties;
import com.pollisensebackend.domain.DashboardPreference;
import com.pollisensebackend.domain.Station;
import com.pollisensebackend.repository.AlertRepository;
import com.pollisensebackend.repository.DashboardPreferenceRepository;
import com.pollisensebackend.repository.DeviceHealthSnapshotRepository;
import com.pollisensebackend.repository.DeviceRepository;
import com.pollisensebackend.repository.ObservationRecordRepository;
import com.pollisensebackend.repository.StationRepository;
import com.pollisensebackend.service.IngestionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class PolliSenseController {

    private final StationRepository stations;
    private final DeviceRepository devices;
    private final DeviceHealthSnapshotRepository healthSnapshots;
    private final ObservationRecordRepository records;
    private final AlertRepository alerts;
    private final DashboardPreferenceRepository preferences;
    private final IngestionService ingestionService;
    private final PolliSenseProperties properties;

    public PolliSenseController(StationRepository stations, DeviceRepository devices,
            DeviceHealthSnapshotRepository healthSnapshots, ObservationRecordRepository records, AlertRepository alerts,
            DashboardPreferenceRepository preferences, IngestionService ingestionService, PolliSenseProperties properties) {
        this.stations = stations;
        this.devices = devices;
        this.healthSnapshots = healthSnapshots;
        this.records = records;
        this.alerts = alerts;
        this.preferences = preferences;
        this.ingestionService = ingestionService;
        this.properties = properties;
    }

    @GetMapping("/stations")
    public List<Station> stations() {
        return stations.findAll();
    }

    @GetMapping("/devices")
    public List<DeviceResponse> devices() {
        return devices.findAll().stream().map(DeviceResponse::from).toList();
    }

    @GetMapping("/records")
    public List<RecordResponse> records(@RequestParam(defaultValue = "250") int limit) {
        int pageSize = Math.min(1000, Math.max(1, limit));
        return records.findAllByOrderByTimestampDesc(PageRequest.of(0, pageSize)).stream()
                .map(RecordResponse::from)
                .toList();
    }

    @GetMapping("/alerts")
    public List<AlertResponse> alerts() {
        return alerts.findTop50ByOrderByTimestampDesc().stream().map(AlertResponse::from).toList();
    }

    @GetMapping("/device-health")
    public List<DeviceHealthResponse> deviceHealth() {
        return healthSnapshots.findAll().stream().map(DeviceHealthResponse::from).toList();
    }

    @GetMapping("/preferences")
    public DashboardPreferencesResponse preferences() {
        return DashboardPreferencesResponse.from(defaultPreferences());
    }

    @PutMapping("/preferences")
    public DashboardPreferencesResponse savePreferences(@Valid @RequestBody DashboardPreferencesRequest request) {
        DashboardPreference preference = defaultPreferences();
        preference.apply(
                request.targetGroups(),
                request.visibleWidgets(),
                request.defaultStationId(),
                request.dateRange(),
                request.layoutMode(),
                request.alertThresholds().minConfidence(),
                request.alertThresholds().lowBattery(),
                request.alertThresholds().offlineHours(),
                request.alertThresholds().activityDropPercent());
        return DashboardPreferencesResponse.from(preferences.save(preference));
    }

    @GetMapping("/summary")
    public SummaryResponse summary() {
        int pollinators = records.findAll().stream().mapToInt(record -> record.getPollinatorCount()).sum();
        double averageBattery = devices.findAll().stream().mapToInt(device -> device.getBatteryLevel()).average().orElse(0);
        return new SummaryResponse(records.count(), alerts.count(), pollinators, Math.round(averageBattery * 10.0) / 10.0);
    }

    @PostMapping("/ingest")
    public ResponseEntity<RecordResponse> ingest(
            @RequestHeader(name = "X-Ingestion-Token", required = false) String token,
            @Valid @RequestBody IngestionRecordRequest request) {
        if (!properties.ingestionToken().equals(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(RecordResponse.from(ingestionService.ingest(request)));
    }

    private DashboardPreference defaultPreferences() {
        return preferences.findById(DashboardPreference.DEFAULT_ID)
                .orElseGet(() -> preferences.save(new DashboardPreference(
                        DashboardPreference.DEFAULT_ID,
                        List.of("honeybee", "bumblebee", "hoverfly"),
                        List.of("activity", "environment", "correlations", "alerts", "station-status", "insights"),
                        "station-meadow-01",
                        "30d",
                        "combined view",
                        0.7,
                        25,
                        12,
                        35)));
    }
}
