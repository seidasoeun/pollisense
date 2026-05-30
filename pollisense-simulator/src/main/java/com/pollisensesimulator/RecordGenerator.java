package com.pollisensesimulator;

import java.time.Instant;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Component;

@Component
public class RecordGenerator {

    private static final List<StationDevice> STATIONS = List.of(
            new StationDevice("station-meadow-01", "ps-001"),
            new StationDevice("station-meadow-01", "ps-002"),
            new StationDevice("station-orchard-02", "ps-003"),
            new StationDevice("station-wetland-03", "ps-004"),
            new StationDevice("station-wetland-03", "ps-005"));
    private static final List<String> TARGET_GROUPS = List.of("HONEYBEE", "BUMBLEBEE", "BUTTERFLY", "HOVERFLY");

    private final AtomicInteger sequence = new AtomicInteger();
    private final Random random = new Random();

    public IngestionRecord next() {
        int tick = sequence.incrementAndGet();
        StationDevice stationDevice = STATIONS.get(tick % STATIONS.size());
        double dayWave = (Math.sin(tick / 8.0) + 1) / 2;
        int signalQuality = clamp((int) Math.round(55 + random.nextGaussian() * 16), 0, 100);
        int batteryLevel = clamp(78 - (tick % 80) + random.nextInt(7), 8, 100);
        String connectivityStatus = signalQuality < 12 ? "OFFLINE" : signalQuality < 38 ? "WEAK" : "GOOD";
        String moduleStatus = random.nextDouble() < 0.08 ? "ATTENTION" : "OK";

        return new IngestionRecord(
                Instant.now(),
                stationDevice.stationId(),
                stationDevice.deviceId(),
                TARGET_GROUPS.get(tick % TARGET_GROUPS.size()),
                Math.max(0, (int) Math.round(6 + dayWave * 31 + random.nextGaussian() * 5)),
                round(clampDouble(0.62 + dayWave * 0.26 + random.nextGaussian() * 0.05, 0.42, 0.98)),
                round(12 + dayWave * 11 + random.nextGaussian() * 1.4),
                round(clampDouble(72 - dayWave * 24 + random.nextGaussian() * 5, 32, 96)),
                clamp((int) Math.round(180 + dayWave * 650 + random.nextGaussian() * 70), 50, 1000),
                batteryLevel,
                connectivityStatus,
                signalQuality,
                batteryLevel < 18 ? "ATTENTION" : moduleStatus);
    }

    private static int clamp(int value, int min, int max) {
        return Math.min(max, Math.max(min, value));
    }

    private static double clampDouble(double value, double min, double max) {
        return Math.min(max, Math.max(min, value));
    }

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private record StationDevice(String stationId, String deviceId) {
    }
}
