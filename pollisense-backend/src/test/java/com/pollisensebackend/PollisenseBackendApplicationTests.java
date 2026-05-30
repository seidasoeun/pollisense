package com.pollisensebackend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest
class PollisenseBackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void actuatorHealthEndpointsAreAvailable() throws Exception {
        mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
        mockMvc.perform(get("/actuator/health/readiness")).andExpect(status().isOk());
        mockMvc.perform(get("/actuator/health/liveness")).andExpect(status().isOk());
    }

    @Test
    void ingestionRequiresTokenAndGeneratesAlertsForFaultScenarios() throws Exception {
        String faultRecord = """
                {
                  "timestamp": "2026-05-30T12:00:00Z",
                  "stationId": "station-meadow-01",
                  "deviceId": "ps-001",
                  "targetGroup": "HONEYBEE",
                  "pollinatorCount": 12,
                  "confidence": 0.82,
                  "temperature": 21.4,
                  "humidity": 52.1,
                  "lightLevel": 680,
                  "batteryLevel": 12,
                  "connectivityStatus": "OFFLINE",
                  "signalQuality": 18,
                  "moduleStatus": "ATTENTION"
                }
                """;

        mockMvc.perform(post("/api/ingest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(faultRecord))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/ingest")
                        .header("X-Ingestion-Token", "test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(faultRecord))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.stationId").value("station-meadow-01"))
                .andExpect(jsonPath("$.deviceId").value("ps-001"));

        mockMvc.perform(get("/api/records"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].stationId").value("station-meadow-01"));

        mockMvc.perform(get("/api/device-health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].batteryLevel").value(12));

        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].title", hasItem("Low battery")))
                .andExpect(jsonPath("$[*].title", hasItem("Connectivity degraded")))
                .andExpect(jsonPath("$[*].title", hasItem("Weak signal")))
                .andExpect(jsonPath("$[*].title", hasItem("Module attention required")));
    }
}
