package com.ecosphere.ecosphere.controller;

import com.ecosphere.ecosphere.service.OpenAIService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
public class AITestController {

    private final OpenAIService openAIService;

    public AITestController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    @PostMapping("/api/ai/test")
    public String testAI(@RequestParam("image") MultipartFile image) throws Exception {

        Path tempFile = Files.createTempFile("waste-", ".jpg");
        image.transferTo(tempFile.toFile());

        return openAIService.classifyWaste(tempFile.toString());
    }
}