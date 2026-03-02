package com.collegemate.collegemate.syllabus;

import com.collegemate.collegemate.syllabus.Syllabus;
import com.collegemate.collegemate.syllabus.dto.SyllabusDashboardDto;
import lombok.RequiredArgsConstructor;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.collegemate.collegemate.syllabus.SylSerImp;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class SylController {
    private final SylSerImp sylSerImp;

    @GetMapping("/syllabus")
    public ResponseEntity<List<SyllabusDashboardDto>> getAllSyllabuses() {
        try {
            List<SyllabusDashboardDto> syllabuses = sylSerImp.getAllUserSyllabuses();
            return ResponseEntity.ok(syllabuses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/syllabus/{id}")
    public ResponseEntity<?> getSyllabusById(@PathVariable Long id) {
        try {
            Syllabus syl = sylSerImp.getSyllabusById(id);
            return ResponseEntity.ok(syl);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred while fetching the syllabus.");
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> getFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            String content;
            String contentType = file.getContentType();

            if (contentType != null && contentType.contains("pdf")) {
                try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
                    content = new PDFTextStripper().getText(doc);
                }
            } 
            else {
                content = new String(file.getBytes(), StandardCharsets.UTF_8);
            }

            String title = file.getOriginalFilename();
            if(title == null || title.isEmpty()) {
                title = "Untitled Syllabus";
            }

            Syllabus savedSyllabus = sylSerImp.generateAndSaveSyllabus(content);
            return ResponseEntity.ok(savedSyllabus);

        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.status(500).body("Error processing file: " + e.getMessage());
        }
    }
}