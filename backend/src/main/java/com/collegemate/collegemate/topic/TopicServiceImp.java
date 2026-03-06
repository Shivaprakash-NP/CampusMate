package com.collegemate.collegemate.topic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TopicServiceImp implements TopicService {
    private final TopicRepository topicRepository;

    public double toggleTopicCompletion(Long topicId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        topic.setCompleted(!topic.isCompleted());
        topicRepository.save(topic);

        if (topic.getSchedulePerDay() != null) {
            Long scheduleId = topic.getSchedulePerDay().getSchedule().getId();
            long total = topicRepository.countTopicsByScheduleId(scheduleId);
            long completed = topicRepository.countCompletedTopicsByScheduleId(scheduleId);

            if (total == 0) return 0.0;
            return Math.round((((double) completed / total) * 100.0) * 10.0) / 10.0;
        } else {
            long syllabusId = topic.getSyllabus().getId();
            long total = topicRepository.countSubtopicsBySyllabusId(syllabusId);
            long completed = topicRepository.countCompletedSubtopicsBySyllabusId(syllabusId);

            if (total == 0) return 0.0;
            return Math.round((((double) completed / total) * 100.0) * 10.0) / 10.0;
        }
    }
}