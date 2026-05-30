package com.pollisensebackend.repository;

import java.util.UUID;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pollisensebackend.domain.DeviceHealthSnapshot;

public interface DeviceHealthSnapshotRepository extends JpaRepository<DeviceHealthSnapshot, UUID> {

    List<DeviceHealthSnapshot> findTop100ByOrderByTimestampDesc();
}
