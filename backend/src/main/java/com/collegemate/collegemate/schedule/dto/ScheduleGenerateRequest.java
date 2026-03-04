package com.collegemate.collegemate.schedule.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Data
public class ScheduleGenerateRequest {
    private String PlanTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<PortionLimit> portions;

    @Data
    public static class PortionLimit {
        private String Title;
        private MultipartFile syllabusFile;
        private Integer endSequenceOrder;
        private List<MultipartFile> pyq;
    }
}