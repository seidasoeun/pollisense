package com.pollisensebackend.api;

import java.util.List;

import com.pollisensebackend.domain.DashboardPreference;

public record DashboardPreferencesResponse(
        List<String> targetGroups,
        List<String> visibleWidgets,
        String defaultStationId,
        String dateRange,
        String layoutMode,
        AlertThresholds alertThresholds) {

    public static DashboardPreferencesResponse from(DashboardPreference preference) {
        return new DashboardPreferencesResponse(
                preference.getTargetGroups(),
                preference.getVisibleWidgets(),
                preference.getDefaultStationId(),
                preference.getDateRange(),
                preference.getLayoutMode(),
                new AlertThresholds(
                        preference.getMinConfidence(),
                        preference.getLowBattery(),
                        preference.getOfflineHours(),
                        preference.getActivityDropPercent()));
    }

    public record AlertThresholds(double minConfidence, int lowBattery, int offlineHours, int activityDropPercent) {
    }
}
