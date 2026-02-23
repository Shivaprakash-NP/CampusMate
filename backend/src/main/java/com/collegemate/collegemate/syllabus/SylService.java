package com.collegemate.collegemate.resource;

import com.collegemate.collegemate.syllabus.Syllabus;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface SylService {
    public Syllabus generateAndSaveSyllabus(String syllabusText, String syllabusTitle);
    public List<Syllabus> getAllUserSyllabuses();
    public Syllabus getSyllabusById(Long syllabusId);
}
