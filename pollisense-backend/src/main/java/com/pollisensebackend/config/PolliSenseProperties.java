package com.pollisensebackend.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "pollisense")
public record PolliSenseProperties(String ingestionToken, List<String> corsOrigins) {
}
