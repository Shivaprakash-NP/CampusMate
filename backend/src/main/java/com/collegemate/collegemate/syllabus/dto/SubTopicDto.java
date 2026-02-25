package com.collegemate.collegemate.syllabus.dto;

import lombok.Data;
import java.util.List;

@Data
public class SubTopicDto {
    private String title;
    private List<ResourceDto> resources;
}
