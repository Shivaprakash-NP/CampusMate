/*
 Done 3 service like get list of topics the user have 
 added new topic for a give users obj
 Then when a user completed a topic update that as completed
*/

package com.collegemate.collegemate.topic;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.collegemate.collegemate.user.UserRepository;
import com.collegemate.collegemate.user.Users;

@Service
@RequiredArgsConstructor
public class TopicServiceImp implements TopicService {
    private final TopicRepository topicRepository;

    public double toggleTopicCompletion(Long topicId) {
        Topic topic = topicRepository.findById(topicId).orElseThrow(() -> new RuntimeException("Topic not found"));

        topic.setCompleted(!topic.isCompleted());
        topicRepository.save(topic);

        long syllabusId = topic.getSyllabus().getId();

        long total = topicRepository.countSubtopicsBySyllabusId(syllabusId);
        long completed = topicRepository.countCompletedSubtopicsBySyllabusId(syllabusId);

        if(total == 0) return 0.0;

        return ((double)(completed/total))*100.0;
    }
}
