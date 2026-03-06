package com.collegemate.collegemate.schedule;

import com.collegemate.collegemate.schedule.dto.ScheduleGenerateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error generating Schedule");
        }
    }

    @GetMapping("/getSchedule")
    public ResponseEntity<?> getAllSchedule() {
        try {
             List<Schedule> scheduleList = scheduleService.getAllSchedules();
             return ResponseEntity.ok(scheduleList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error getting Schedules");
        }
    }

    @GetMapping("/getSchedule/{Id}")
    public ResponseEntity<?> getParticularSchedule(@PathVariable Long Id) {
        try {
            Schedule currectSchedule = scheduleService.getParticularSchedule(Id);
            return ResponseEntity.ok(currectSchedule);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error getting Schedules");
        }
    }

    @DeleteMapping("/delete/{id}")
    public void deletePlan(@PathVariable Long id) {
        try {
            scheduleService.deletePlan(id);
        } catch (Exception e) {
            throw new RuntimeException("Error Deleting Your Plan");
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updatePlan(@RequestBody Schedule newPlan) {
        try {
            Schedule updated = scheduleService.updateSchedule(newPlan);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating Schedule");
        }
    }
}
