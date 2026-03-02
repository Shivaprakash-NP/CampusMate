package com.collegemate.collegemate.Chat;

import com.collegemate.collegemate.Chat.dto.ChatDto;
import com.collegemate.collegemate.syllabus.Syllabus;
import com.collegemate.collegemate.syllabus.SyllabusRepo;
import com.collegemate.collegemate.topic.Topic;
import com.collegemate.collegemate.topic.TopicRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import reactor.core.publisher.Flux;
import com.google.genai.Client;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ai.model.tool.ToolCallingManager;
import org.springframework.retry.support.RetryTemplate;
import io.micrometer.observation.ObservationRegistry;
import org.springframework.beans.factory.ObjectProvider;
import reactor.core.publisher.Hooks;

@Service
public class ChatService {
    private final ChatClient chatClient;
    private final TopicRepository topicRepository;
    private final SyllabusRepo syllabusRepo;
    private final ChatMemory chatMemory;

    public ChatService(
            @Value("${gemini.chat.api-key}") String chatApiKey,
            TopicRepository topicRepository,
            SyllabusRepo syllabusRepo,
            ObjectProvider<ToolCallingManager> toolCallingManagerProvider,
            ObjectProvider<RetryTemplate> retryTemplateProvider,
            ObjectProvider<ObservationRegistry> observationRegistryProvider) {

        Client customGoogleClient = Client.builder()
                .apiKey(chatApiKey)
                .build();

        GoogleGenAiChatModel customChatModel = new GoogleGenAiChatModel(
                customGoogleClient,
                GoogleGenAiChatOptions.builder().model("gemini-3-flash-preview").build(),
                toolCallingManagerProvider.getIfAvailable(),
                retryTemplateProvider.getIfAvailable(RetryTemplate::new),
                observationRegistryProvider.getIfAvailable(() -> ObservationRegistry.NOOP)
        );

        this.chatClient = ChatClient.builder(customChatModel).build();
        this.topicRepository = topicRepository;
        this.syllabusRepo = syllabusRepo;
        this.chatMemory = MessageWindowChatMemory.builder().maxMessages(10).build();

        Hooks.onErrorDropped(e -> {
            if (e.getMessage() != null && e.getMessage().contains("Failed to read next JSON")) {
                // The frontend gracefully disconnected. Do nothing.
            } else {
                // If it's a real background error, print it
                System.err.println("Dropped Error: " + e.getMessage());
            }
        });
    }

    public Flux<String> chat(ChatDto chatReq) {
        try {
            StringBuilder Sysprompt = new StringBuilder(
                    "You are 'CampusMate', a friendly and highly knowledgeable college tutor. " +
                            "Keep your answers concise, clear, and easy to read. Format with markdown if needed. "
            );

            if (chatReq.getTopicId() != null) {
                Topic topic = topicRepository.findById(chatReq.getTopicId()).orElseThrow(() -> new RuntimeException("Topic Not Found"));
                Sysprompt.append("This user is currently studying a specific topic called '").append(topic.getTitle()).append("'. Answer their question strictly in the context of this topic.");
            } else if (chatReq.getSyllabusId() != null) {
                Syllabus syllabus = syllabusRepo.findById(chatReq.getSyllabusId()).orElseThrow(() -> new RuntimeException("Syllabus Not Found"));
                Sysprompt.append("The user is asking a general question about their course titled '").append(syllabus.getTitle()).append("'. Provide a helpful, broad answer related to this subject.");
            }

            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            String convoId = email + "-" + (chatReq.getTopicId() == null ? chatReq.getSyllabusId() : chatReq.getTopicId());

            return chatClient.prompt()
                    .system(Sysprompt.toString())
                    .user(chatReq.getMessage())
                    .options(GoogleGenAiChatOptions.builder()
                            .model("gemini-3-flash-preview")
                            .build())
                    .advisors(MessageChatMemoryAdvisor.builder(chatMemory).conversationId(convoId).build())
                    .stream()
                    .content();

        } catch (Exception e) {
            return Flux.just("Error: CampusMate is having trouble thinking right now. ");
        }
    }
}