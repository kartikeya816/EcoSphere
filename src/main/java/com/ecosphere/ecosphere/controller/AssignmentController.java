package com.ecosphere.ecosphere.controller;

import com.ecosphere.ecosphere.entity.Assignment;
import com.ecosphere.ecosphere.entity.Report;
import com.ecosphere.ecosphere.repository.AssignmentRepository;
import com.ecosphere.ecosphere.repository.ReportRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;
    private final ReportRepository reportRepository;

    public AssignmentController(
            AssignmentRepository assignmentRepository,
            ReportRepository reportRepository) {

        this.assignmentRepository = assignmentRepository;
        this.reportRepository = reportRepository;
    }

    @GetMapping
    public List<Assignment> getAssignments() {
        return assignmentRepository.findAll();
    }

    @PostMapping
    public Assignment createAssignment(
            @RequestBody Assignment assignment) {

        return assignmentRepository.save(assignment);
    }

    @PutMapping("/{id}/status")
    public Assignment updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        Assignment assignment =
                assignmentRepository.findById(id).orElseThrow();

        Report report =
                reportRepository.findById(assignment.getReportId())
                        .orElseThrow();

        if ("IN_PROGRESS".equals(status)) {

            assignment.setStatus("IN_PROGRESS");
            report.setStatus("IN_PROGRESS");
        }

        if ("COMPLETED".equals(status)) {

            if (!"IN_PROGRESS".equals(assignment.getStatus())) {
                throw new IllegalStateException(
                        "Work must be started before completing the assignment."
                );
            }

            assignment.setStatus("COMPLETED");
            report.setStatus("COMPLETED");
        }

        Assignment savedAssignment =
                assignmentRepository.save(assignment);

        reportRepository.save(report);

        return savedAssignment;
    }

    @GetMapping("/worker/{workerId}")
    public List<Assignment> getWorkerAssignments(
            @PathVariable Integer workerId) {

        return assignmentRepository.findByWorkerId(workerId)
                .stream()
                .filter(a -> !"COMPLETED".equals(a.getStatus()))
                .toList();
    }

    @GetMapping("/{id}/report")
    public Report getAssignmentReport(@PathVariable Integer id) {

        Assignment assignment =
                assignmentRepository.findById(id).orElseThrow();

        return reportRepository.findById(assignment.getReportId())
                .orElseThrow();
    }
}