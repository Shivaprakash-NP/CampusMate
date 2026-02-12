package com.collegemate.collegemate.topic;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long>{
    List<Topic> findByUsersId(Long userId);
}
