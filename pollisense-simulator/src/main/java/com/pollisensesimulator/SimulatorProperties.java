package com.pollisensesimulator;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "pollisense")
public record SimulatorProperties(String backendUrl, String ingestionToken, long intervalMs) {
}
