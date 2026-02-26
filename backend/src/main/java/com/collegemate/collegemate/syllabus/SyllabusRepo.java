package com.collegemate.collegemate.syllabus;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.collegemate.collegemate.user.Users;

@Repository
public interface SyllabusRepo extends JpaRepository<Syllabus, Long> {
    public List<Syllabus> findByUser(Users user);
    public Optional<Syllabus> findByUserAndContentHash(Users user, String contentHash);
}
