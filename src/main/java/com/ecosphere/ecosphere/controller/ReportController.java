package com.ecosphere.ecosphere.controller;

import com.ecosphere.ecosphere.entity.Report;
import com.ecosphere.ecosphere.repository.ReportRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportRepository reportRepository;

    public ReportController(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    @GetMapping
    public List<Report> getReports() {
        return reportRepository.findAll();
    }

    @PostMapping
    public Report createReport(@RequestBody Report report) {
        return reportRepository.save(report);
    }

    @GetMapping("/track/{hashCode}")
    public Report trackReport(@PathVariable String hashCode) {

        return reportRepository.findByHashCode(hashCode)
                .orElseThrow();
    }
}