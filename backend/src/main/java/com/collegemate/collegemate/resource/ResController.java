package com.collegemate.collegemate.resource;
import org.apache.pdfbox.Loader; 
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;


@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
public class ResController {
    
    private final ResService resService;
    @PostMapping("/api/upload")
    public String getFile(@RequestParam("file") MultipartFile file) throws IOException {

        try(InputStream is = file.getInputStream();
            PDDocument doc = Loader.loadPDF(is.readAllBytes())) {
            PDFTextStripper strip = new PDFTextStripper();
            return resService.getTopicsFromSyllubus(strip.getText(doc));
        } catch(Exception e) {
            throw new RuntimeException("Failed to parse PDF", e);
        }
    }
}