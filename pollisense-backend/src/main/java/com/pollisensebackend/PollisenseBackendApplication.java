package com.pollisensebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PollisenseBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(PollisenseBackendApplication.class, args);
    }

}
