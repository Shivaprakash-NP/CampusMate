package com.collegemate.collegemate.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface scheduleRepo extends JpaRepository<Schedule, Long> {
    
}
