package com.pollisensebackend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pollisensebackend.domain.DeviceHealthSnapshot;

public interface DeviceHealthSnapshotRepository extends JpaRepository<DeviceHealthSnapshot, UUID> {
}
