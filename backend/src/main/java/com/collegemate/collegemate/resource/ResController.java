package com.collegemate.collegemate.resource;

import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequiredArgsConstructor
public class ResController {
    
    private final ResSerImp resSerImp;

    @PostMapping("/api/upload")
    public ResponseEntity<String> getFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            String content;
            String contentType = file.getContentType();

            // 1. Handle PDF
            if (contentType != null && contentType.contains("pdf")) {
                try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
                    content = new PDFTextStripper().getText(doc);
                }
            } 
            // 2. Handle Text or fallback (treat as plain text)
            else {
                content = new String(file.getBytes(), StandardCharsets.UTF_8);
            }

            // 3. Call Service and return the String result
            String result = resSerImp.getTopicsFromSyllubus(content);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.status(500).body("Error processing file: " + e.getMessage());
        }
    }
}