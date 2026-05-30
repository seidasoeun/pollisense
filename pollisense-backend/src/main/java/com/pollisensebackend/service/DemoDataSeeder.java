package com.pollisensebackend.service;

import java.util.List;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import com.pollisensebackend.domain.ConnectivityStatus;
import com.pollisensebackend.domain.DashboardPreference;
import com.pollisensebackend.domain.Device;
import com.pollisensebackend.domain.ModuleStatus;
import com.pollisensebackend.domain.Station;
import com.pollisensebackend.repository.DashboardPreferenceRepository;
import com.pollisensebackend.repository.DeviceRepository;
import com.pollisensebackend.repository.StationRepository;

@Component
public class DemoDataSeeder {

    @Bean
    ApplicationRunner seedDemoData(StationRepository stations, DeviceRepository devices,
            DashboardPreferenceRepository preferences) {
        return args -> {
            if (stations.count() == 0) {
                stations.saveAll(List.of(
                        new Station("station-meadow-01", "Meadow Edge A", "North Meadow Plot", "Wildflower meadow edge", 52.5224, 13.3760),
                        new Station("station-orchard-02", "Orchard Row C", "Experimental Orchard", "Mixed fruit tree row", 52.5191, 13.3697),
                        new Station("station-wetland-03", "Wetland Transect B", "Riparian Buffer Zone", "Wetland margin", 52.5286, 13.3842)));
            }

            if (devices.count() == 0) {
                devices.saveAll(List.of(
                        new Device("ps-001", "station-meadow-01", "PolliSense PS-001", 86, 72, ConnectivityStatus.GOOD, ModuleStatus.OK),
                        new Device("ps-002", "station-meadow-01", "PolliSense PS-002", 58, 29, ConnectivityStatus.WEAK, ModuleStatus.ATTENTION),
                        new Device("ps-003", "station-orchard-02", "PolliSense PS-003", 91, 81, ConnectivityStatus.GOOD, ModuleStatus.OK),
                        new Device("ps-004", "station-wetland-03", "PolliSense PS-004", 0, 16, ConnectivityStatus.OFFLINE, ModuleStatus.OFFLINE),
                        new Device("ps-005", "station-wetland-03", "PolliSense PS-005", 74, 64, ConnectivityStatus.WEAK, ModuleStatus.OK)));
            }

            if (preferences.count() == 0) {
                preferences.save(new DashboardPreference(
                        DashboardPreference.DEFAULT_ID,
                        List.of("honeybee", "bumblebee", "hoverfly"),
                        List.of("activity", "environment", "correlations", "alerts", "station-status", "insights"),
                        "station-meadow-01",
                        "30d",
                        "combined view",
                        0.7,
                        25,
                        12,
                        35));
            }
        };
    }
}
