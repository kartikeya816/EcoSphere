package com.ecosphere.ecosphere.repository;

import com.ecosphere.ecosphere.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkerRepository extends JpaRepository<Worker, Integer> {
}