package com.collegemate.collegemate.syllabus;

import com.collegemate.collegemate.common.enums.Difficulty;
import com.collegemate.collegemate.common.enums.Types;
import com.collegemate.collegemate.resource.Resources;
import com.collegemate.collegemate.syllabus.Syllabus;
import com.collegemate.collegemate.syllabus.SyllabusRepo;
import com.collegemate.collegemate.syllabus.dto.SyllabusDashboardDto;
import com.collegemate.collegemate.syllabus.dto.TopicResponseDto;
import com.collegemate.collegemate.topic.Topic;
import com.collegemate.collegemate.topic.TopicRepository;
import com.collegemate.collegemate.user.UserRepository;
import com.collegemate.collegemate.user.Users;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SylSerImp implements SylService {
    public final ChatClient chatClient;
    public final SyllabusRepo syllabusRepo;
    public final UserRepository userRepo;
    public final ObjectMapper objectMapper;
    public final TopicRepository topicRepository;

    public Syllabus generateAndSaveSyllabus(String syllabusText, String syllabusTitle) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        String prompt = """
            You are an expert curriculum parser. Extract all topics and subtopics from the following syllabus.
            You must respond ONLY with a valid JSON array matching the exact structure below. Do not include markdown formatting like ```json.
            Ensure the "type" field is strictly either "ARTICLE" or "VIDEO".
            
            CRITICAL: The "url" field MUST be a raw, plain text URL only. DO NOT wrap the URL in markdown brackets like [url](url).
            
            Structure:
            [
              {
                "title": "Main Topic Name",
                "children": [
                  {
                    "title": "Subtopic Name",
                    "resources": [
                      {
                        "type": "VIDEO",
                        "title": "YouTube Search: [Subtopic Name]",
                        "url": "[https://www.youtube.com/results?search_query=Subtopic+Name](https://www.youtube.com/results?search_query=Subtopic+Name)"
                      },
                      {
                        "type": "ARTICLE",
                        "title": "Read about [Subtopic Name]",
                        "url": "[https://www.google.com/search?q=site:geeksforgeeks.org+Subtopic+Name](https://www.google.com/search?q=site:geeksforgeeks.org+Subtopic+Name)"
                      }
                    ]
                  }
                ]
              }
            ]
            
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

            List<TopicResponseDto> dtoList = objectMapper.readValue(jsonResponse, new TypeReference<List<TopicResponseDto>>() {});
            
            Syllabus syllabus = new Syllabus();
            syllabus.setTitle(syllabusTitle);
            syllabus.setUser(currentUser);

            for(TopicResponseDto mainDto : dtoList) {
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
                                resource.setUrl(resDto.getUrl());

                                try {
                                    resource.setType(Types.valueOf(resDto.getType().toUpperCase()));
                                } catch (IllegalArgumentException e) {
                                    resource.setType(Types.ARTICLE);
                                }

                                String rawURL = resDto.getUrl();
                                if(rawURL != null && rawURL.contains("](") && rawURL.endsWith(")")) {
                                    rawURL = rawURL.substring(rawURL.indexOf("](")+2, rawURL.length()-1);
                                }
                                resDto.setUrl(rawURL);

                                subTopic.addResource(resource);
                            }
                        }
                        mainTopic.addSubTopic(subTopic);
                    }
                }
                syllabus.getTopics().add(mainTopic);
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
