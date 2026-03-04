package com.collegemate.collegemate.Chat.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class ChatDto {
    private String message;
    private Long SyllabusId;
    private Long TopicId;
}