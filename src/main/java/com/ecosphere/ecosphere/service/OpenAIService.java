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
    public String compareWasteImages(
            String newImagePath,
            String oldImagePath,
            String newLocation,
            String oldLocation,
            String newDescription,
            String oldDescription) throws Exception {

        byte[] newImage = Files.readAllBytes(Path.of(newImagePath));
        byte[] oldImage = Files.readAllBytes(Path.of(oldImagePath));

        Content content = Content.fromParts(

                Part.fromText(
                        "Compare these two waste reports.\n\n" +

                                "NEW REPORT LOCATION: " + newLocation + "\n" +
                                "NEW REPORT DESCRIPTION: " + newDescription + "\n\n" +

                                "OLD REPORT LOCATION: " + oldLocation + "\n" +
                                "OLD REPORT DESCRIPTION: " + oldDescription + "\n\n" +

                                "Determine whether these reports are likely describing " +
                                "the same physical waste location/problem.\n\n" +

                                "Consider:\n" +
                                "- visual similarity of the waste\n" +
                                "- similarity of the location descriptions\n" +
                                "- similarity of the descriptions\n" +
                                "- whether the reports appear to refer to the same place\n\n" +

                                "Return ONLY this format:\n" +
                                "SIMILARITY: <number from 0 to 100>\n" +
                                "REASON: <short explanation>"
                ),

                Part.fromBytes(newImage, "image/jpeg"),
                Part.fromBytes(oldImage, "image/jpeg")
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