package com.pollisensebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pollisensebackend.domain.Device;

public interface DeviceRepository extends JpaRepository<Device, String> {
}
