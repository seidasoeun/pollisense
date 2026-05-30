package com.pollisensesimulator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class SimulatorJob {

    private static final Logger log = LoggerFactory.getLogger(SimulatorJob.class);

    private final RecordGenerator generator;
    private final RestClient restClient;

    public SimulatorJob(RecordGenerator generator, RestClient restClient) {
        this.generator = generator;
        this.restClient = restClient;
    }

    @Scheduled(fixedDelayString = "${pollisense.interval-ms}")
    public void sendRecord() {
        IngestionRecord record = generator.next();
        try {
            restClient.post()
                    .uri("/api/ingest")
                    .body(record)
                    .retrieve()
                    .toBodilessEntity();
            log.info("sent record station={} device={} target={} count={}",
                    record.stationId(), record.deviceId(), record.targetGroup(), record.pollinatorCount());
        } catch (RestClientException ex) {
            log.warn("could not send record to backend: {}", ex.getMessage());
        }
    }
}
