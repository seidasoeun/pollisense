package com.pollisensesimulator;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class SimulatorClientConfig {

    @Bean
    RestClient restClient(SimulatorProperties properties) {
        return RestClient.builder()
                .baseUrl(properties.backendUrl())
                .defaultHeader("X-Ingestion-Token", properties.ingestionToken())
                .build();
    }
}
