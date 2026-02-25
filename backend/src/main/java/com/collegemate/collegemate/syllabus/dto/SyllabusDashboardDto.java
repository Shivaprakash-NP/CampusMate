package com.collegemate.collegemate.syllabus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SyllabusDashboardDto {
    private Long id;
    private String title;
    private long totalTopics;
    private long completedTopics;
    private double progressPercentage;
}
