package com.collegemate.collegemate.resource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
public class ResController {
    
    private final ResService resService;

    @PostMapping("/api/upload")
    public String getFile(@RequestParam("file") MultipartFile file) throws IOException {
        String syllabus = new String(file.getBytes(), StandardCharsets.UTF_8);
        return resService.getTopicsFromSyllubus(syllabus);
    }
    
}
