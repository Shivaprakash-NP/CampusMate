package com.collegemate.collegemate.schedule;

import com.collegemate.collegemate.schedule.dto.ScheduleGenerateRequest;
import com.collegemate.collegemate.schedule.dto.SyllabusSummaryDto;
import com.collegemate.collegemate.syllabus.Syllabus;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/schedule")
public class ScheduleController {
    private final ScheduleService scheduleService;

    @PostMapping("/extract")
    public ResponseEntity<?> extractSyllabuses(@RequestParam("files") List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body("No files were uploaded.");
        }

        StringBuilder combinedSyllabusContent = new StringBuilder();

        try {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                String content;
                String contentType = file.getContentType();
                String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "Untitled_Syllabus";

                if (contentType != null && contentType.contains("pdf")) {
                    try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
                        content = new PDFTextStripper().getText(doc);
                    }
                } else {
                    content = new String(file.getBytes(), StandardCharsets.UTF_8);
                }

                combinedSyllabusContent.append("\n\n========================================================================\n");
                combinedSyllabusContent.append(" BEGIN FILE: \n");
                combinedSyllabusContent.append("========================================================================\n\n");
                combinedSyllabusContent.append(content);
            }

            List<Syllabus> extractedSyllabuses = scheduleService.extractSyllabuses(combinedSyllabusContent.toString());

            List<SyllabusSummaryDto> list = extractedSyllabuses.stream().map(syllabus -> {
               SyllabusSummaryDto ssd = new SyllabusSummaryDto();
               ssd.setTitle(syllabus.getTitle());
               ssd.setSyllabusId(syllabus.getId());

               return ssd;
            }).toList();

            return ResponseEntity.ok(list);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing files: " + e.getMessage());
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateSchedule(@RequestBody ScheduleGenerateRequest scheduleGenerateRequest) {
        try {
            if(scheduleGenerateRequest.getStartDate().isAfter(scheduleGenerateRequest.getEndDate())) {
                return ResponseEntity.badRequest().body("Start date must be before end date.");
            }

            Schedule finalSchedule = scheduleService.generateSchedule(scheduleGenerateRequest);

            return ResponseEntity.ok(finalSchedule);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating Schedule");
        }
    }
}
