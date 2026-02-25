package com.collegemate.collegemate.syllabus;

import com.collegemate.collegemate.syllabus.Syllabus;
import java.util.List;

import com.collegemate.collegemate.syllabus.dto.SyllabusDashboardDto;
import org.springframework.web.multipart.MultipartFile;

public interface SylService {
    public Syllabus generateAndSaveSyllabus(String syllabusText, String syllabusTitle);
    public List<SyllabusDashboardDto> getAllUserSyllabuses();
    public Syllabus getSyllabusById(Long syllabusId);
}
