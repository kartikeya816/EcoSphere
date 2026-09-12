package com.ecosphere.ecosphere.controller;

import com.ecosphere.ecosphere.entity.Report;
import com.ecosphere.ecosphere.repository.ReportRepository;
import com.ecosphere.ecosphere.service.OpenAIService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/reports")
public class FileUploadController {

    private final OpenAIService openAIService;
    private final ReportRepository reportRepository;

    public FileUploadController(OpenAIService openAIService,
                                ReportRepository reportRepository) {
        this.openAIService = openAIService;
        this.reportRepository = reportRepository;
    }

    @PostMapping("/upload")
    public String uploadImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam("location") String location,
            @RequestParam("description") String description) throws Exception {

        Path uploadPath = Path.of("uploads");

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(image.getOriginalFilename());

        Files.copy(
                image.getInputStream(),
                filePath,
                java.nio.file.StandardCopyOption.REPLACE_EXISTING
        );

        String wasteType = openAIService.classifyWaste(filePath.toString());

        Report report = new Report();


        String hashCode = "EC-" + java.util.UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();

        report.setHashCode(hashCode);

        report.setUserId(1);
        report.setImagePath(filePath.toString());
        report.setWasteType(wasteType);
        report.setLocation(location);
        report.setDescription(description);

        reportRepository.save(report);

        return "Report created successfully. Waste type: "
                + wasteType
                + " | Your tracking code: "
                + hashCode;
    }
    @GetMapping("/image/{fileName}")
    public org.springframework.core.io.Resource getImage(
            @PathVariable String fileName) {

        Path path = Path.of("uploads").resolve(fileName);

        return new org.springframework.core.io.FileSystemResource(path);
    }
    @ExceptionHandler(Exception.class)
    public org.springframework.http.ResponseEntity<String> handleException(Exception e) {

        return org.springframework.http.ResponseEntity
                .badRequest()
                .body("Report submission failed: " + e.getMessage());
    }
}