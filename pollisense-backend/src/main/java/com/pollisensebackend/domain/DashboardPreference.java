package com.pollisensebackend.domain;

import java.util.Arrays;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "dashboard_preferences")
public class DashboardPreference {

    public static final String DEFAULT_ID = "default";

    @Id
    private String id;

    private String targetGroups;
    private String visibleWidgets;
    private String defaultStationId;
    private String dateRange;
    private String layoutMode;
    private double minConfidence;
    private int lowBattery;
    private int offlineHours;
    private int activityDropPercent;

    protected DashboardPreference() {
    }

    public DashboardPreference(String id, List<String> targetGroups, List<String> visibleWidgets, String defaultStationId,
            String dateRange, String layoutMode, double minConfidence, int lowBattery, int offlineHours,
            int activityDropPercent) {
        this.id = id;
        apply(targetGroups, visibleWidgets, defaultStationId, dateRange, layoutMode, minConfidence, lowBattery,
                offlineHours, activityDropPercent);
    }

    public void apply(List<String> targetGroups, List<String> visibleWidgets, String defaultStationId, String dateRange,
            String layoutMode, double minConfidence, int lowBattery, int offlineHours, int activityDropPercent) {
        this.targetGroups = String.join(",", targetGroups);
        this.visibleWidgets = String.join(",", visibleWidgets);
        this.defaultStationId = defaultStationId;
        this.dateRange = dateRange;
        this.layoutMode = layoutMode;
        this.minConfidence = minConfidence;
        this.lowBattery = lowBattery;
        this.offlineHours = offlineHours;
        this.activityDropPercent = activityDropPercent;
    }

    public String getId() {
        return id;
    }

    public List<String> getTargetGroups() {
        return split(targetGroups);
    }

    public List<String> getVisibleWidgets() {
        return split(visibleWidgets);
    }

    public String getDefaultStationId() {
        return defaultStationId;
    }

    public String getDateRange() {
        return dateRange;
    }

    public String getLayoutMode() {
        return layoutMode;
    }

    public double getMinConfidence() {
        return minConfidence;
    }

    public int getLowBattery() {
        return lowBattery;
    }

    public int getOfflineHours() {
        return offlineHours;
    }

    public int getActivityDropPercent() {
        return activityDropPercent;
    }

    private static List<String> split(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(",")).map(String::trim).filter(item -> !item.isBlank()).toList();
    }
}
