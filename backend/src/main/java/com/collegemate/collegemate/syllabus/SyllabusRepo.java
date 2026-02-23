package com.collegemate.collegemate.syllabus;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.collegemate.collegemate.user.Users;
import com.networknt.schema.OutputFormat.List;

@Repository
public interface SyllabusRepo extends JpaRepository<Syllabus, Long> {
    public List<Syllabus> findByUser(Users user);
}
