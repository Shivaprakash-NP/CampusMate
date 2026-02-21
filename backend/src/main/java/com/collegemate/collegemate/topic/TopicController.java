package com.collegemate.collegemate.topic;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import java.util.*;

@RestController
@RequestMapping("/api/topics")
public class TopicController {
    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @GetMapping("/{userId}")
    public List<Topic> getTopics(@PathVariable Long userId) {
        return topicService.getTopicList(userId);
    }

    @PostMapping("/{userId}")
    public Topic addTopic(@PathVariable Long userId, @RequestBody Topic topic) {
        return topicService.addNewTopic(userId, topic);
    }

    @PatchMapping("/{topicId}/complete")
    public Topic markCompleted(@PathVariable Long topicId) {
        return topicService.updateAsCompleted(topicId);
    }
}
