package com.collegemate.collegemate.schedule;

import com.collegemate.collegemate.user.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepo extends JpaRepository<Schedule, Long> {
    List<Schedule> findAllByUser(Users users);
}
