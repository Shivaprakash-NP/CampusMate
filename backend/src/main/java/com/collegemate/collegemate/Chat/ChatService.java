package com.collegemate.collegemate.Chat;

import com.collegemate.collegemate.Chat.dto.ChatDto;
import com.collegemate.collegemate.syllabus.Syllabus;
import com.collegemate.collegemate.syllabus.SyllabusRepo;
import com.collegemate.collegemate.topic.Topic;
import com.collegemate.collegemate.topic.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatClient chatClient;
    private final TopicRepository topicRepository;
    private final SyllabusRepo syllabusRepo;

    public ResponseEntity<?> chat(ChatDto chatReq) {
        try {
            StringBuilder Sysprompt = new StringBuilder(
                    "You are 'CampusMate', a friendly and highly knowledgeable college tutor. " +
                    "Keep your answers concise, clear, and easy to read. Format with markdown if needed. "
            );

            if(chatReq.getTopicId() != null) {
                Topic topic = topicRepository.findById(chatReq.getTopicId()).orElseThrow(() -> new RuntimeException("Topic Not Found"));
                Sysprompt.append("This user is currently studying a specific topic called '").append(topic.getTitle()).append("'. Answer their question strictly in the context of this topic.");
            } else if(chatReq.getSyllabusId() != null) {
                Syllabus syllabus = syllabusRepo.findById(chatReq.getSyllabusId()).orElseThrow(() -> new RuntimeException("Syllabus Not Found"));
                Sysprompt.append("The user is asking a general question about their course titled '").append(syllabus.getTitle()).append("'. Provide a helpful, broad answer related to this subject.");
            }

            String response = chatClient.prompt()
                                        .system(Sysprompt.toString())
                                        .user(chatReq.getMessage())
                                        .options(GoogleGenAiChatOptions.builder()
                                                .model("gemini-3-flash-preview")
                                                .build())
                                        .call()
                                        .content();

            return ResponseEntity.ok(Map.of("reply", response));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "CampusMate is having trouble thinking right now."));
        }
    }
}
