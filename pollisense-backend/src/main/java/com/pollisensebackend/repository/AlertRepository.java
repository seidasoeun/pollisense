package com.pollisensebackend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pollisensebackend.domain.Alert;

public interface AlertRepository extends JpaRepository<Alert, UUID> {

    List<Alert> findTop50ByOrderByTimestampDesc();
}
