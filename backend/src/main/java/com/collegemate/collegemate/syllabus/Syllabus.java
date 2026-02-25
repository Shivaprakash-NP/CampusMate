package com.collegemate.collegemate.syllabus;

import java.util.*;
import com.collegemate.collegemate.topic.Topic;
import com.collegemate.collegemate.user.Users;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="syllabuses")
@Getter
@Setter
@NoArgsConstructor
public class Syllabus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false)
    @JsonIgnore
    private Users user;

    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL, orphanRemoval = true)    
    @JsonManagedReference
    private List<Topic> topics = new ArrayList<>();
}
