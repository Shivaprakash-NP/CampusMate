package com.collegemate.collegemate.schedule;

import com.collegemate.collegemate.common.enums.Difficulty;
import com.collegemate.collegemate.common.enums.Types;
import com.collegemate.collegemate.resource.Resources;
import com.collegemate.collegemate.schedule.dto.ScheduleGenerateRequest;
import com.collegemate.collegemate.syllabus.Syllabus;
import com.collegemate.collegemate.syllabus.SyllabusRepo;
import com.collegemate.collegemate.syllabus.dto.SyllabusResponseDto;
import com.collegemate.collegemate.syllabus.dto.TopicResponseDto;
import com.collegemate.collegemate.topic.Topic;
import com.collegemate.collegemate.topic.TopicRepository;
import com.collegemate.collegemate.user.Users;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.collegemate.collegemate.user.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    public final ChatClient chatClient;
    public final SyllabusRepo syllabusRepo;
    public final UserRepository userRepo;
    public final ObjectMapper objectMapper;
    public final TopicRepository topicRepository;

    private String calculateSHA256(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();

            for(byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if(hex.length() == 1) hexString.append("0");
                hexString.append(hex);
            }

            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error calculating Hash", e);
        }
    }

    public List<Syllabus> extractSyllabuses(String combinedSyllabusText) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        String getHex = calculateSHA256(combinedSyllabusText);

        // --- UPDATED AI PROMPT ---
        String prompt = """
            You are an expert curriculum parser. The following text contains MULTIPLE syllabuses separated by markers like "📄 BEGIN SYLLABUS FILE: [filename]".

            CRITICAL INSTRUCTIONS:
            1. Parse EACH syllabus individually.
            2. For the `syllabusTitle`, you MUST use the exact [filename] provided in the separator. DO NOT guess the subject name.
            3. Provide specific, real URLs for resources. For VIDEO, use highly popular YouTube watch URLs. For ARTICLE, use reputable sites (geeksforgeeks, javatpoint, etc.).
            4. ZERO HALLUCINATION on URLs.

            You must respond ONLY with a valid JSON ARRAY matching the exact structure below. 
            Do not include markdown formatting like ```json.

            Structure MUST be an Array:
            [
              {
                "syllabusTitle": "Exact Filename From Separator (e.g. CS3451_Operating_Systems.pdf)",
                "topics": [
                  {
                    "title": "Main Topic Name",
                    "children": [
                      {
                        "title": "Subtopic Name",
                          "resources": [
                            {
                              "type": "VIDEO",
                              "title": "Detailed Video on [Subtopic Name]",
                              "url": "https://www.youtube.com/watch?v=specific_video_id"
                            },
                            {
                              "type": "ARTICLE",
                              "title": "Comprehensive Guide on [Subtopic Name]",
                              "url": "https://www.geeksforgeeks.org/specific-article-slug/"
                            }
                          ]
                      }
                    ]
                  }
                ]
              }
            ]

            Combined Syllabus Text:
            """ + combinedSyllabusText;

        try {
            String jsonResponse = chatClient.prompt().user(prompt).call().content();

            if(jsonResponse.startsWith("```json")) {
                jsonResponse = jsonResponse.substring(7, jsonResponse.length()-3).trim();
            } else if(jsonResponse.startsWith("```")) {
                jsonResponse = jsonResponse.substring(3, jsonResponse.length()-3).trim();
            }

            List<SyllabusResponseDto> parsedDataList = objectMapper.readValue(
                    jsonResponse,
                    new TypeReference<List<SyllabusResponseDto>>() {}
            );

            List<Syllabus> savedSyllabuses = new ArrayList<>();

            for (SyllabusResponseDto parsedData : parsedDataList) {
                Syllabus syllabus = new Syllabus();
                syllabus.setTitle(parsedData.getSyllabusTitle());
                syllabus.setUser(currentUser);
                syllabus.setContentHash(getHex);

                int order = 1;

                if (parsedData.getTopics() != null) {
                    for(TopicResponseDto mainDto : parsedData.getTopics()) {
                        Topic mainTopic = new Topic();
                        mainTopic.setTitle(mainDto.getTitle());
                        mainTopic.setCompleted(false);
                        mainTopic.setDifficulty(Difficulty.MEDIUM);
                        mainTopic.setUsers(currentUser);
                        mainTopic.setSyllabus(syllabus);

                        if(mainDto.getChildren() != null) {
                            for(var subDto : mainDto.getChildren()) {
                                Topic subTopic = new Topic();
                                subTopic.setTitle(subDto.getTitle());
                                subTopic.setCompleted(false);
                                subTopic.setDifficulty(Difficulty.MEDIUM);
                                subTopic.setUsers(currentUser);
                                subTopic.setSyllabus(syllabus);

                                if(subDto.getResources() != null) {
                                    for(var resDto : subDto.getResources()) {
                                        Resources resource = new Resources();
                                        resource.setTitle(resDto.getTitle());

                                        String rawURL = resDto.getUrl();
                                        if(rawURL != null && rawURL.contains("](") && rawURL.endsWith(")")) {
                                            rawURL = rawURL.substring(rawURL.indexOf("](")+2, rawURL.length()-1);
                                        }

                                        resource.setUrl(rawURL);
                                        try {
                                            resource.setType(Types.valueOf(resDto.getType().toUpperCase()));
                                        } catch (IllegalArgumentException e) {
                                            resource.setType(Types.ARTICLE);
                                        }

                                        subTopic.addResource(resource);
                                    }
                                }
                                subTopic.setSequenceOrder(order);
                                mainTopic.addSubTopic(subTopic);
                            }
                        }
                        mainTopic.setSequenceOrder(order);
                        syllabus.getTopics().add(mainTopic);

                        ++order;
                    }
                }

                savedSyllabuses.add(syllabus);
            }

            return syllabusRepo.saveAll(savedSyllabuses);

        } catch(Exception e) {
            throw new RuntimeException("Failed to generate and save syllabuses: " + e.getMessage(), e);
        }
    }

    public Schedule generateSchedule(ScheduleGenerateRequest scheduleGenerateRequest) {
        LocalDate start = scheduleGenerateRequest.getStartDate();
        LocalDate end = scheduleGenerateRequest.getEndDate();

        return null;
    }
}
