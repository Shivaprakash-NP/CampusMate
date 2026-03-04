package com.collegemate.collegemate.schedule;

import com.collegemate.collegemate.schedule.dto.ScheduleGenerateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/schedule")
public class ScheduleController {
    private final ScheduleService scheduleService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateSchedule(@ModelAttribute ScheduleGenerateRequest scheduleGenerateRequest) {
        try {
            if(scheduleGenerateRequest.getStartDate().isAfter(scheduleGenerateRequest.getEndDate())) {
                return ResponseEntity.badRequest().body("Start date must be before end date.");
            }

            Schedule finalSchedule = scheduleService.generateSchedule(scheduleGenerateRequest);

            return ResponseEntity.ok(finalSchedule);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating Schedule");
        }
    }
}
