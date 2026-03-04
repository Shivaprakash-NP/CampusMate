package com.collegemate.collegemate.schedule;

import com.collegemate.collegemate.common.enums.Difficulty;
import com.collegemate.collegemate.common.enums.Types;
import com.collegemate.collegemate.resource.Resources;
import com.collegemate.collegemate.schedule.dto.ScheduleGenerateRequest;
import com.collegemate.collegemate.syllabus.ArticleValidationService;
import com.collegemate.collegemate.syllabus.OEmbedValidationService;
import com.collegemate.collegemate.syllabus.Syllabus;
import com.collegemate.collegemate.syllabus.SyllabusRepo;
import com.collegemate.collegemate.syllabus.dto.SyllabusResponseDto;
import com.collegemate.collegemate.syllabus.dto.TopicResponseDto;
import com.collegemate.collegemate.topic.Topic;
import com.collegemate.collegemate.topic.TopicRepository;
import com.collegemate.collegemate.user.UserRepository;
import com.collegemate.collegemate.user.Users;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final ChatClient chatClient;
    private final SyllabusRepo syllabusRepo;
    private final UserRepository userRepo;
    private final ObjectMapper objectMapper;
    private final TopicRepository topicRepository;
    private final ScheduleRepo scheduleRepo;

    private final OEmbedValidationService oEmbedValidationService;
    private final ArticleValidationService articleValidationService;

    public Schedule generateSchedule(ScheduleGenerateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User Not Found"));

        if (request.getPortions() == null || request.getPortions().isEmpty()) {
            throw new IllegalArgumentException("No portions provided to generate a schedule.");
        }

        List<Syllabus> finalSyllabuses = new ArrayList<>();
        StringBuilder combinedSyllabusText = new StringBuilder();

        List<String> pendingTitles = new ArrayList<>();
        List<String> pendingHashes = new ArrayList<>();
        boolean needsAiCall = false;

        for (ScheduleGenerateRequest.PortionLimit portion : request.getPortions()) {
            String subjectTitle = portion.getTitle();
            String extractedText = extractTextFromPdf(portion.getSyllabusFile());
            String contentHash = calculateSHA256(extractedText);

            Optional<Syllabus> existingSyllabus = syllabusRepo.findByUserAndContentHash(currentUser, contentHash);

            if (existingSyllabus.isPresent()) {
                System.out.println("FOUND DUPLICATE IN DB FOR: " + subjectTitle);
                finalSyllabuses.add(existingSyllabus.get());
            } else {
                System.out.println("NO DUP, PREPARING FOR AI: " + subjectTitle);
                combinedSyllabusText.append("BEGIN SYLLABUS TITLE: ").append(subjectTitle).append("\n");
                combinedSyllabusText.append(extractedText).append("\n");
                combinedSyllabusText.append("END SYLLABUS TITLE: ").append(subjectTitle).append("\n\n");

                pendingTitles.add(subjectTitle);
                pendingHashes.add(contentHash);
                needsAiCall = true;
            }
        }

        if (needsAiCall) {
            List<Syllabus> newSyllabuses = extractAndSaveSyllabuses(combinedSyllabusText.toString(), currentUser, pendingTitles, pendingHashes);
            finalSyllabuses.addAll(newSyllabuses);
        }

        Schedule schedule = new Schedule();
        schedule.setStartDate(request.getStartDate());
        schedule.setEndDate(request.getEndDate());
        schedule.setUser(currentUser);
        schedule.setSchedulePerDayList(new ArrayList<>());

        List<Topic> prioritizedTopics = new ArrayList<>();

        for (ScheduleGenerateRequest.PortionLimit portion : request.getPortions()) {
            String targetTitle = portion.getTitle();

            Syllabus matchedSyllabus = finalSyllabuses.stream()
                    .filter(s -> s.getTitle().equalsIgnoreCase(targetTitle))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Failed to match syllabus with requested title: " + targetTitle));

            List<Topic> relevantTopics = matchedSyllabus.getTopics().stream()
                    .filter(t -> t.getSequenceOrder() <= portion.getEndSequenceOrder())
                    .collect(Collectors.toList());

            if (portion.getPyq() != null && !portion.getPyq().isEmpty()) {
                StringBuilder pyqTextBuilder = new StringBuilder();
                for (MultipartFile pyqFile : portion.getPyq()) {
                    pyqTextBuilder.append(extractTextFromPdf(pyqFile).toLowerCase());
                }
                String pyqText = pyqTextBuilder.toString();
                Map<Topic, Integer> topicWeights = new HashMap<>();

                for (Topic topic : relevantTopics) {
                    int mentions = countMentions(pyqText, topic.getTitle().toLowerCase());
                    if (topic.getSubTopics() != null) {
                        for (Topic subTopic : topic.getSubTopics()) {
                            mentions += countMentions(pyqText, subTopic.getTitle().toLowerCase());
                        }
                    }
                    topicWeights.put(topic, mentions);
                }
                relevantTopics.sort((t1, t2) -> topicWeights.get(t2).compareTo(topicWeights.get(t1)));
            }
            prioritizedTopics.addAll(relevantTopics);
        }

        int totalDays = (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        int totalTopics = prioritizedTopics.size();

        if (totalTopics == 0) throw new RuntimeException("No topics found to schedule within the given sequence order!");

        int topicsPerDay = totalTopics / totalDays;
        int remainder = totalTopics % totalDays;
        int topicIndex = 0;

        for (int i = 0; i < totalDays; i++) {
            SchedulePerDay scheduleDay = new SchedulePerDay();
            scheduleDay.setDate(request.getStartDate().plusDays(i));
            scheduleDay.setSchedule(schedule);
            scheduleDay.setTopics(new ArrayList<>());

            int topicsForThisDay = topicsPerDay;
            if (remainder > 0) {
                topicsForThisDay++;
                remainder--;
            }

            for (int j = 0; j < topicsForThisDay && topicIndex < totalTopics; j++) {
                Topic topicToAssign = prioritizedTopics.get(topicIndex);
                topicToAssign.setSchedulePerDay(scheduleDay);
                scheduleDay.getTopics().add(topicToAssign);
                topicIndex++;
            }
            schedule.getSchedulePerDayList().add(scheduleDay);
        }

        return scheduleRepo.save(schedule);
    }


    private List<Syllabus> extractAndSaveSyllabuses(String combinedSyllabusText, Users currentUser, List<String> pendingTitles, List<String> pendingHashes) {
        String prompt = """
            You are an expert curriculum parser and educational curator. Extract all topics and subtopics from the provided syllabus text.
            
            CRITICAL INSTRUCTIONS:
            1. Parse EACH syllabus individually if multiple are provided. They are separated by "📄 BEGIN SYLLABUS TITLE: [Title]".
            2. PREVENTING 404 ERRORS: Provide the closest valid root URL if unsure.
            3. FALLBACK QUERIES REQUIRED: You MUST provide a `fallbackQueryUrl` for EVERY resource.
               - For VIDEO: Use YouTube search format (e.g., https://www.youtube.com/results?search_query=...)
               - For ARTICLE: Use Google search targeting reputable sites.
            
            You must respond ONLY with a valid JSON ARRAY matching the exact structure below.
            
            [
              {
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

            if (jsonResponse != null && jsonResponse.startsWith("```json")) {
                jsonResponse = jsonResponse.substring(7, jsonResponse.length() - 3).trim();
            } else if (jsonResponse != null && jsonResponse.startsWith("```")) {
                jsonResponse = jsonResponse.substring(3, jsonResponse.length() - 3).trim();
            }

            List<SyllabusResponseDto> parsedDataList = objectMapper.readValue(
                    jsonResponse, new TypeReference<List<SyllabusResponseDto>>() {}
            );

            List<Syllabus> savedSyllabuses = new ArrayList<>();
            int index = 0;

            for (SyllabusResponseDto parsedData : parsedDataList) {
                if (index >= pendingTitles.size()) {
                    break;
                }

                Syllabus syllabus = new Syllabus();

                syllabus.setTitle(pendingTitles.get(index));
                syllabus.setContentHash(pendingHashes.get(index));
                syllabus.setUser(currentUser);
                syllabus.setTopics(new ArrayList<>());

                int order = 1;

                if (parsedData.getTopics() != null) {
                    for (TopicResponseDto mainDto : parsedData.getTopics()) {
                        Topic mainTopic = new Topic();
                        mainTopic.setTitle(mainDto.getTitle());
                        mainTopic.setCompleted(false);
                        mainTopic.setDifficulty(Difficulty.MEDIUM);
                        mainTopic.setUsers(currentUser);
                        mainTopic.setSyllabus(syllabus);
                        mainTopic.setSubTopics(new ArrayList<>());

                        if (mainDto.getChildren() != null) {
                            for (var subDto : mainDto.getChildren()) {
                                Topic subTopic = new Topic();
                                subTopic.setTitle(subDto.getTitle());
                                subTopic.setCompleted(false);
                                subTopic.setDifficulty(Difficulty.MEDIUM);
                                subTopic.setUsers(currentUser);
                                subTopic.setSyllabus(syllabus);
                                subTopic.setResources(new ArrayList<>());

                                if (subDto.getResources() != null) {
                                    for (var resDto : subDto.getResources()) {
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

                                        resource.setFallbackQueryUrl(rawfallBackURL != null ? rawfallBackURL : "https://www.google.com/search?q=" + resDto.getTitle());

                                        boolean isValid = false;
                                        if (rawURL != null) {
                                            if (rawURL.contains("youtube.com") || rawURL.contains("youtu.be")) {
                                                isValid = oEmbedValidationService.isUrlValid("https://www.youtube.com/oembed", rawURL);
                                            } else {
                                                isValid = articleValidationService.isArticleUrlValid(rawURL);
                                            }
                                        }

                                        if(isValid) {
                                            resource.setUrl(rawURL);
                                        } else {
                                            resource.setUrl(rawfallBackURL != null ? rawfallBackURL : "https://www.google.com/search?q=" + resDto.getTitle());
                                        }

                                        try {
                                            resource.setType(Types.valueOf(resDto.getType().toUpperCase()));
                                        } catch (IllegalArgumentException | NullPointerException e) {
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
                        order++;
                    }
                }
                savedSyllabuses.add(syllabus);
                index++;
            }

            return syllabusRepo.saveAll(savedSyllabuses);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate and save syllabuses: " + e.getMessage(), e);
        }
    }

    private String extractTextFromPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) return "";
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            return new PDFTextStripper().getText(doc);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read PDF file: " + file.getOriginalFilename(), e);
        }
    }

    private int countMentions(String fullText, String keyword) {
        if (keyword == null || keyword.isEmpty() || fullText == null) return 0;
        int count = 0;
        int lastIndex = 0;
        while ((lastIndex = fullText.indexOf(keyword, lastIndex)) != -1) {
            count++;
            lastIndex += keyword.length();
        }
        return count;
    }

    private String calculateSHA256(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedhash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append("0");
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error calculating Hash", e);
        }
    }
}