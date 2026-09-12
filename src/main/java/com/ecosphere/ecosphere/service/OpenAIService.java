package com.ecosphere.ecosphere.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class OpenAIService {

    private final Client client;

    public OpenAIService() {
        client = Client.builder()
                .apiKey(System.getenv("GEMINI_API_KEY"))
                .build();
    }

    public String classifyWaste(String imagePath) throws Exception {

        byte[] imageData = Files.readAllBytes(Path.of(imagePath));

        Content content = Content.fromParts(
                Part.fromText(
                        "Classify this waste image into exactly one category: " +
                                "Plastic, Paper, Glass, Metal, Organic, E-waste, or Other. " +
                                "Return only the category."
                ),
                Part.fromBytes(imageData, "image/jpeg")
        );

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3.6-flash",
                        content,
                        null
                );

        return response.text();
    }
}