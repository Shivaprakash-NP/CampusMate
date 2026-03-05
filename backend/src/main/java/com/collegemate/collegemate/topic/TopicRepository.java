package com.collegemate.collegemate.topic;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long>{
    List<Topic> findByUsersId(Long userId);
    @Query("SELECT COUNT(t) FROM Topic t WHERE t.syllabus.id = :syllabusId AND t.parentTopic IS NOT NULL")
    long countSubtopicsBySyllabusId(@Param("syllabusId") Long syllabusId);

    @Query("SELECT COUNT(t) FROM Topic t WHERE t.syllabus.id = :syllabusId AND t.parentTopic IS NOT NULL AND t.completed = true")
    long countCompletedSubtopicsBySyllabusId(@Param("syllabusId") Long syllabusId);
}
