package com.pollisensebackend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.pollisensebackend.domain.ObservationRecord;

public interface ObservationRecordRepository extends JpaRepository<ObservationRecord, UUID> {

    List<ObservationRecord> findAllByOrderByTimestampDesc(Pageable pageable);
}
