package com.pollisensebackend.api;

public record SummaryResponse(long totalRecords, long totalAlerts, int totalPollinators, double averageBatteryLevel) {
}
