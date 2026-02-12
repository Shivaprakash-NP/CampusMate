/*
 Done 3 service like get list of topics the user have 
 added new topic for a give users obj
 Then when a user completed a topic update that as completed
*/

package com.collegemate.collegemate.topic;
import java.util.List;
import org.springframework.stereotype.Service;

import com.collegemate.collegemate.user.UserRepository;
import com.collegemate.collegemate.user.Users;

@Service
public class TopicServiceImp implements TopicService {
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;

    public TopicServiceImp(TopicRepository topicRepository, UserRepository userRepository) {
        this.topicRepository = topicRepository;
        this.userRepository = userRepository;
    }

    public List<Topic> getTopicList(Long user_id) {
        return topicRepository.findByUsersId(user_id);
    }

    public Topic addNewTopic(Long userId, Topic topic) {
        Users user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User Not Found"));
        
        topic.setUsers(user);
        topic.setCompleted(false);
        return topicRepository.save(topic);
    }

    public Topic updateAsCompleted(Long topicId) {
        Topic topic = topicRepository.findById(topicId).orElseThrow(() -> new RuntimeException("Topic Not Found"));
        topic.setCompleted(true);
        return topicRepository.save(topic);
    }
}
