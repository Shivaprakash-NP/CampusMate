package com.collegemate.collegemate.resource;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class ResController {
    
    @PostMapping("/api/upload")
    public void getFile(@RequestParam("file") MultipartFile file) {
        System.out.println(file.getOriginalFilename()+" "+file.getSize());
    }
    
}
