package com.collegemate.collegemate.resource;

import org.hibernate.validator.constraints.URL;

import com.collegemate.collegemate.common.enums.Types;
import com.collegemate.collegemate.topic.Topic;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "resources")
@Setter
@Getter
@NoArgsConstructor
public class Resources {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Types type;

    @Column(nullable = false)
    private String title; 

    @Column(nullable = false)
    @NotBlank
    @URL
    private String url;

    @Column(nullable = false)
    @NotBlank
    @URL
    private String fallbackQueryUrl;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonBackReference("topic-resource")
    private Topic topic;
}
