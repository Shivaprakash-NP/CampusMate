package com.collegemate.collegemate.topic;

import java.util.List;

import com.collegemate.collegemate.user.Users;

public interface TopicService {

    List<Topic> getTopicList(Long userId);

    Topic addNewTopic(Long userId, Topic topic);

    Topic updateAsCompleted(Long topicId);
}

