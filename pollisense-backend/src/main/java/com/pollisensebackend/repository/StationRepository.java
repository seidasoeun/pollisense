package com.pollisensebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pollisensebackend.domain.Station;

public interface StationRepository extends JpaRepository<Station, String> {
}
