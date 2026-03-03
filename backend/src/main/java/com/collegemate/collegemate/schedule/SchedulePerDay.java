package com.collegemate.collegemate.schedule;

import com.collegemate.collegemate.topic.Topic;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class SchedulePerDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    @JsonBackReference
    private Schedule schedule;

    @Column
    private LocalDate date;

    @OneToMany(mappedBy = "schedulePerDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Topic> topics = new ArrayList<>();
}
