package com.collegemate.collegemate.syllabus.dto;

import lombok.Data;
import java.util.List;

@Data
public class SyllabusResponseDto {
    private String syllabusTitle;
    private List<TopicResponseDto> topics;
}