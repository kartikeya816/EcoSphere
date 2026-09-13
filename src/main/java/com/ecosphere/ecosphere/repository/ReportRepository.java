package com.ecosphere.ecosphere.repository;

import com.ecosphere.ecosphere.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Integer> {

    Optional<Report> findByHashCode(String hashCode);
    Optional<Report> findByImageHash(String imageHash);
}