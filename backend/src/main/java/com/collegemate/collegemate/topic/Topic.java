package com.collegemate.collegemate.topic;

import java.util.ArrayList;
import java.util.List;

import com.collegemate.collegemate.common.enums.Difficulty;
import com.collegemate.collegemate.resource.Resources;
import com.collegemate.collegemate.schedule.SchedulePerDay;
import com.collegemate.collegemate.syllabus.Syllabus;
import com.collegemate.collegemate.user.Users;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import io.opencensus.resource.Resource;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="topics")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Topic {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty = Difficulty.MEDIUM;   
    
    @Column(nullable = false)
    private boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private Users users;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonBackReference("parent-subtopic")
    private Topic parentTopic;

    @OneToMany(mappedBy = "parentTopic", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("parent-subtopic")
    private List<Topic> subTopics = new ArrayList<>();

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("topic-resource")
    private List<Resources> resources = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "syllabus_id", nullable = false)
    @JsonBackReference("syllabus-topic")    
    private Syllabus syllabus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_day_id")
    @JsonBackReference("day-topic")
    private SchedulePerDay schedulePerDay;

    @Column(nullable = false)
    private Integer sequenceOrder;

    public void addSubTopic(Topic subTopic) {
        subTopics.add(subTopic);
        subTopic.setParentTopic(this);
    }

    public void addResource(Resources resource) {
        resources.add(resource);
        resource.setTopic(this);
    }
}
