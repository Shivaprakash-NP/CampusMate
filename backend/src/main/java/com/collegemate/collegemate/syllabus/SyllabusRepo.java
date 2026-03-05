package com.collegemate.collegemate.syllabus;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.collegemate.collegemate.user.Users;

@Repository
public interface SyllabusRepo extends JpaRepository<Syllabus, Long> {
    List<Syllabus> findByUser(Users user);
    Optional<Syllabus> findFirstByUserAndContentHashAndIsForGeneralTrue(Users user, String contentHash);
    List<Syllabus> findByUserAndIsForGeneralTrue(Users user);
}
