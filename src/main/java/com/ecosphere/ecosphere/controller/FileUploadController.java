package com.ecosphere.ecosphere.controller;

import com.ecosphere.ecosphere.entity.Report;
import com.ecosphere.ecosphere.repository.ReportRepository;
import com.ecosphere.ecosphere.service.OpenAIService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;

@RestController
@RequestMapping("/api/reports")
public class FileUploadController {

    private final OpenAIService openAIService;
    private final ReportRepository reportRepository;

    public FileUploadController(
            OpenAIService openAIService,
            ReportRepository reportRepository) {

        this.openAIService = openAIService;
        this.reportRepository = reportRepository;
    }

    private String generateImageHash(byte[] imageData) throws Exception {

        MessageDigest digest =
                MessageDigest.getInstance("SHA-256");

        byte[] hash = digest.digest(imageData);

        return HexFormat.of().formatHex(hash);
    }

    @PostMapping("/upload")
    public String uploadImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam("location") String location,
            @RequestParam("description") String description,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude)
            throws Exception {

        System.out.println("GPS Latitude: " + latitude);
        System.out.println("GPS Longitude: " + longitude);

        Path uploadPath = Path.of("uploads");

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        byte[] imageData = image.getBytes();

        String imageHash =
                generateImageHash(imageData);

        // EXACT IMAGE DUPLICATE CHECK
        java.util.Optional<Report> existingReport =
                reportRepository.findByImageHash(imageHash);

        if (existingReport.isPresent()) {

            Report duplicate = existingReport.get();

            return "Possible duplicate report detected. " +
                    "This image was already reported with tracking code: " +
                    duplicate.getHashCode();
        }

        Path filePath =
                uploadPath.resolve(image.getOriginalFilename());

        Files.copy(
                image.getInputStream(),
                filePath,
                java.nio.file.StandardCopyOption.REPLACE_EXISTING
        );

        // AI WASTE CLASSIFICATION
        String wasteType =
                openAIService.classifyWaste(
                        filePath.toString()
                );

        // CREATE NEW REPORT
        Report report = new Report();

        String hashCode =
                "EC-" +
                        java.util.UUID.randomUUID()
                                .toString()
                                .substring(0, 8)
                                .toUpperCase();

        report.setImageHash(imageHash);
        report.setHashCode(hashCode);
        report.setUserId(1);
        report.setImagePath(filePath.toString());
        report.setWasteType(wasteType);
        report.setLocation(location);
        report.setDescription(description);
        report.setLatitude(latitude);
        report.setLongitude(longitude);

        // AI SEMANTIC DUPLICATE CHECK
        for (Report oldReport :
                reportRepository.findAll()) {

            if (oldReport.getLatitude() == null ||
                    oldReport.getLongitude() == null ||
                    oldReport.getImagePath() == null) {

                continue;
            }

            double distance =
                    calculateDistance(
                            latitude,
                            longitude,
                            oldReport.getLatitude(),
                            oldReport.getLongitude()
                    );

            // Only compare reports within 100 meters
            if (distance <= 100) {

                String comparison =
                        openAIService.compareWasteImages(
                                filePath.toString(),
                                oldReport.getImagePath(),
                                location,
                                oldReport.getLocation(),
                                description,
                                oldReport.getDescription()
                        );

                int similarity = 0;

                try {

                    String similarityLine =
                            comparison.split("\n")[0];

                    similarity =
                            Integer.parseInt(
                                    similarityLine
                                            .replace(
                                                    "SIMILARITY:",
                                                    ""
                                            )
                                            .trim()
                            );

                } catch (Exception e) {

                    System.out.println(
                            "Could not parse AI similarity."
                    );
                }

                System.out.println(
                        "Nearby report #" +
                                oldReport.getId()
                );

                System.out.println(
                        "Distance: " +
                                distance +
                                " meters"
                );

                System.out.println(
                        "AI Comparison: " +
                                comparison
                );

                // POSSIBLE DUPLICATE
                if (similarity >= 70) {

                    report.setDuplicateOfReportId(
                            oldReport.getId()
                    );

                    report.setDuplicateConfidence(
                            similarity
                    );

                    report.setStatus(
                            "POSSIBLE_DUPLICATE"
                    );

                    System.out.println(
                            "⚠ POSSIBLE DUPLICATE: " +
                                    similarity +
                                    "%"
                    );

                    // Stop after finding a strong match
                    break;
                }
            }
        }

        System.out.println(
                "Saving Latitude: " +
                        report.getLatitude()
        );

        System.out.println(
                "Saving Longitude: " +
                        report.getLongitude()
        );

        // SAVE REPORT
        reportRepository.save(report);

        return "Report created successfully. Waste type: "
                + wasteType
                + " | Your tracking code: "
                + hashCode;
    }

    @GetMapping("/image/{fileName}")
    public org.springframework.core.io.Resource getImage(
            @PathVariable String fileName) {

        Path path =
                Path.of("uploads").resolve(fileName);

        return new org.springframework.core.io.FileSystemResource(
                path
        );
    }

    @ExceptionHandler(Exception.class)
    public org.springframework.http.ResponseEntity<String>
    handleException(Exception e) {

        return org.springframework.http.ResponseEntity
                .badRequest()
                .body(
                        "Report submission failed: " +
                                e.getMessage()
                );
    }

    private double calculateDistance(
            double lat1,
            double lon1,
            double lat2,
            double lon2) {

        final int EARTH_RADIUS = 6371000;

        double latDistance =
                Math.toRadians(lat2 - lat1);

        double lonDistance =
                Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(latDistance / 2)
                        * Math.sin(latDistance / 2)
                        +
                        Math.cos(Math.toRadians(lat1))
                                * Math.cos(Math.toRadians(lat2))
                                * Math.sin(lonDistance / 2)
                                * Math.sin(lonDistance / 2);

        double c =
                2 * Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                );

        return EARTH_RADIUS * c;
    }
}