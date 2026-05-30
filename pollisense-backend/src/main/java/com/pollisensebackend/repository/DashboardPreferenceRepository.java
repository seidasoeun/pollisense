package com.pollisensebackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pollisensebackend.domain.DashboardPreference;

public interface DashboardPreferenceRepository extends JpaRepository<DashboardPreference, String> {
}
