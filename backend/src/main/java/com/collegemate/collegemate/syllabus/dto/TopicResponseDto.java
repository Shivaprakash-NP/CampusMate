package com.collegemate.collegemate.syllabus.dto;

import lombok.Data;
import java.util.List;

@Data
public class TopicResponseDto {
    private String title;
    private List<SubTopicDto> children;
}