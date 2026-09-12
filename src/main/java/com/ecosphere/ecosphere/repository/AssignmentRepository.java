package com.ecosphere.ecosphere.repository;

import com.ecosphere.ecosphere.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Integer> {

    List<Assignment> findByWorkerId(Integer workerId);
}