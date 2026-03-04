package com.collegemate.collegemate.syllabus;

import com.collegemate.collegemate.common.enums.Difficulty;
import com.collegemate.collegemate.common.enums.Types;
import com.collegemate.collegemate.resource.Resources;
import com.collegemate.collegemate.syllabus.dto.SyllabusDashboardDto;
import com.collegemate.collegemate.syllabus.dto.SyllabusResponseDto;
import com.collegemate.collegemate.syllabus.dto.TopicResponseDto;
import com.collegemate.collegemate.topic.Topic;
import com.collegemate.collegemate.topic.TopicRepository;
import com.collegemate.collegemate.user.UserRepository;
import com.collegemate.collegemate.user.Users;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SylSerImp {
    private final ChatClient chatClient;
    private final SyllabusRepo syllabusRepo;
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper;
    private final TopicRepository topicRepository;
    private final OEmbedValidationService oEmbedValidationService;
    private final ArticleValidationService articleValidationService;

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

    public Syllabus generateAndSaveSyllabus(String syllabusText) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        String getHex = calculateSHA256(syllabusText);
        var getUser = syllabusRepo.findByUserAndContentHash(currentUser, getHex);

        if(getUser.isPresent()) {
            System.out.println("FOUND DUPLICATE");
            return getUser.get();
        } else {
            System.out.println("NO DUP");
        }

        String prompt = """
            You are an expert curriculum parser and educational curator. Extract the exact main subject name, along with all topics and subtopics from the provided syllabus text.
        
            CRITICAL INSTRUCTIONS FOR SUBJECT NAME:
            1. EXTRACT, DO NOT GUESS: You must extract the exact subject/course name as it appears in the syllabus text. Do not invent, infer, or guess a generic name. Look for the most prominent header or title at the beginning of the text.
        
            CRITICAL INSTRUCTIONS FOR RESOURCES & URLS:
            1. PREVENTING 404 ERRORS: Large Language Models sometimes hallucinate specific URLs. If you are not 100% certain that a specific direct URL exists, provide the closest valid root URL. 
            2. FALLBACK QUERIES REQUIRED: Because exact URLs may break or result in 404s, you MUST provide a `fallbackQueryUrl` for EVERY resource. 
               - For VIDEO: The fallback must be a fully formed YouTube search URL (e.g., https://www.youtube.com/results?search_query=Your+Topic+Here).
               - For ARTICLE: The fallback must be a fully formed Google search URL targeting reputable sites (e.g., https://www.google.com/search?q=site:geeksforgeeks.org+OR+site:javatpoint.com+Your+Topic+Here).
            3. REPUTABLE SOURCES ONLY: For articles, use geeksforgeeks.org, tutorialspoint.com, or javatpoint.com. For videos, use youtube.com.
        
            You must respond ONLY with a valid JSON object matching the exact structure below. Do not include markdown formatting like ```json or ``` at the beginning or end.
        
            Expected JSON Structure:
            {
              "syllabusTitle": "EXACT Subject Name extracted from text",
              "topics": [
                {
                  "title": "Main Topic Name",
                  "children": [
                    {
                      "title": "Subtopic Name",
                      "resources": [
                        {
                          "type": "VIDEO",
                          "title": "Video on [Subtopic Name]",
                          "url": "https://www.youtube.com/watch?v=specific_video_id",
                          "fallbackQueryUrl": "https://www.youtube.com/results?search_query=Subject+Name+Subtopic+Name"
                        },
                        {
                          "type": "ARTICLE",
                          "title": "Guide on [Subtopic Name]",
                          "url": "https://www.geeksforgeeks.org/specific-article-slug/",
                          "fallbackQueryUrl": "https://www.google.com/search?q=site:geeksforgeeks.org+OR+site:tutorialspoint.com+Subject+Name+Subtopic+Name"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
        
            Syllabus Text:
            """ + syllabusText;

        try {
            String jsonResponse = chatClient.prompt().user(prompt).call().content();

            System.out.println(jsonResponse);

            if(jsonResponse.startsWith("```json")) {
                jsonResponse = jsonResponse.substring(7, jsonResponse.length()-3).trim();
            } else if(jsonResponse.startsWith("```")) {
                jsonResponse = jsonResponse.substring(3, jsonResponse.length()-3).trim();
            }

            SyllabusResponseDto parsedData = objectMapper.readValue(jsonResponse, SyllabusResponseDto.class);
            
            Syllabus syllabus = new Syllabus();
            syllabus.setTitle(parsedData.getSyllabusTitle());
            syllabus.setUser(currentUser);
            syllabus.setContentHash(getHex);

            int order = 1;

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
                                String rawfallBackURL = resDto.getFallbackQueryUrl();

                                if(rawURL != null && rawURL.contains("](") && rawURL.endsWith(")")) {
                                    rawURL = rawURL.substring(rawURL.indexOf("](")+2, rawURL.length()-1);
                                }

                                if(rawfallBackURL != null && rawfallBackURL.contains("](") && rawfallBackURL.endsWith(")")) {
                                    rawfallBackURL = rawfallBackURL.substring(rawfallBackURL.indexOf("](")+2, rawfallBackURL.length()-1);
                                }

                                boolean isValid = false;
                                isValid |= oEmbedValidationService.isUrlValid("https://www.youtube.com/oembed", rawURL);
                                isValid |= articleValidationService.isArticleUrlValid(rawURL);

                                if(isValid) resource.setUrl(rawURL);
                                else resource.setUrl(rawfallBackURL);

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

            return syllabusRepo.save(syllabus);

        } catch(Exception e) {
            throw new RuntimeException("Failed to generate and save syllabus: " + e.getMessage(), e);        
        }
    }

    public List<SyllabusDashboardDto> getAllUserSyllabuses(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentuser = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User Not Found"));


        List<Syllabus> syllabuses = syllabusRepo.findByUser(currentuser);

        return syllabuses.stream().map(syllabus -> {
            Long id = syllabus.getId();
            String title = syllabus.getTitle();
            long total = topicRepository.countSubtopicsBySyllabusId(id);
            long com = topicRepository.countCompletedSubtopicsBySyllabusId(id);

            double progress = total == 0 ? 0.0 : ((double) com/total) * 100.0;

            return new SyllabusDashboardDto(id, title, total, com, progress);
        }).toList();
    }

    public Syllabus getSyllabusById(Long syllabusId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentuser = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User Not Found"));

        Syllabus syllabus = syllabusRepo.findById(syllabusId).orElseThrow(() -> new RuntimeException("Syllabus not found with ID: " + syllabusId));

        if (!syllabus.getUser().getId().equals(currentuser.getId())) {
            throw new RuntimeException("Unauthorized: You do not have permission to view this syllabus.");
        }

        return syllabus;
    }
}
