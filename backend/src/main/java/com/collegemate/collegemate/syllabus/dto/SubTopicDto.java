package com.collegemate.collegemate.syllabus.dto;

import lombok.Data;
import java.util.List;

@Data
class SubTopicDto {
    private String title;
    private List<ResourceDto> resources;
}
