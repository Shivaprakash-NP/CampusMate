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
    private final ScheduleRepo scheduleRepo;

    private final OEmbedValidationService oEmbedValidationService;
    private final ArticleValidationService articleValidationService;

    private Users getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User Not Found"));
    }

    public Schedule generateSchedule(ScheduleGenerateRequest request) {
        Users currentUser = getCurrentUser();

        if (request.getPortions() == null || request.getPortions().isEmpty()) {
            throw new IllegalArgumentException("No portions provided to generate a schedule.");
        }

        Map<String, Syllabus> titleToSyllabusMap = new HashMap<>();
        StringBuilder combinedSyllabusText = new StringBuilder();

        List<String> pendingTitles = new ArrayList<>();
        List<String> pendingHashes = new ArrayList<>();
        boolean needsAiCall = false;

        for (ScheduleGenerateRequest.PortionLimit portion : request.getPortions()) {
            String subjectTitle = portion.getTitle();
            String extractedText = extractTextFromFile(portion.getSyllabusFile());
            String contentHash = calculateSHA256(extractedText);

            Optional<Syllabus> existingSyllabus = syllabusRepo.findFirstByUserAndContentHashAndIsForGeneralTrue(currentUser, contentHash);

            if (existingSyllabus.isPresent()) {
                System.out.println("FOUND DUPLICATE IN DB FOR: " + subjectTitle + " -> CLONING DATA");
                Syllabus clonedSyllabus = cloneSyllabusEntity(existingSyllabus.get(), subjectTitle, currentUser);
                Syllabus savedClone = syllabusRepo.save(clonedSyllabus);
                titleToSyllabusMap.put(subjectTitle, savedClone);
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
            for (int i = 0; i < newSyllabuses.size(); i++) {
                titleToSyllabusMap.put(pendingTitles.get(i), newSyllabuses.get(i));
            }
        }

        Schedule schedule = new Schedule();
        schedule.setStartDate(request.getStartDate());
        schedule.setEndDate(request.getEndDate());
        schedule.setUser(currentUser);
        schedule.setSchedulePerDayList(new ArrayList<>());
        schedule.setTitle(request.getPlanTitle());

        List<Topic> prioritizedTopics = new ArrayList<>();

        for (ScheduleGenerateRequest.PortionLimit portion : request.getPortions()) {
            String targetTitle = portion.getTitle();
            Syllabus matchedSyllabus = titleToSyllabusMap.get(targetTitle);

            if (matchedSyllabus == null) {
                throw new RuntimeException("Failed to match syllabus with requested title: " + targetTitle);
            }

            List<Topic> relevantMainTopics = matchedSyllabus.getTopics().stream()
                    .filter(t -> t.getSequenceOrder() <= portion.getEndSequenceOrder())
                    .collect(Collectors.toList());

            List<Topic> relevantSubTopics = new ArrayList<>();
            for (Topic mainTopic : relevantMainTopics) {
                if (mainTopic.getSubTopics() != null && !mainTopic.getSubTopics().isEmpty()) {
                    relevantSubTopics.addAll(mainTopic.getSubTopics());
                }
            }

            relevantSubTopics.sort(Comparator.comparing(Topic::getSequenceOrder));

            if (portion.getPyq() != null && !portion.getPyq().isEmpty()) {
                StringBuilder pyqTextBuilder = new StringBuilder();
                for (MultipartFile pyqFile : portion.getPyq()) {
                    pyqTextBuilder.append(extractTextFromFile(pyqFile).toLowerCase());
                }
                String pyqText = pyqTextBuilder.toString();

                Map<Topic, Integer> subTopicWeights = new HashMap<>();
                for (Topic subTopic : relevantSubTopics) {
                    int mentions = countMentions(pyqText, subTopic.getTitle().toLowerCase());
                    if (subTopic.getParentTopic() != null) {
                        mentions += (countMentions(pyqText, subTopic.getParentTopic().getTitle().toLowerCase()) / 2);
                    }
                    subTopicWeights.put(subTopic, mentions);
                }

                relevantSubTopics.sort((t1, t2) -> {
                    int weightCompare = subTopicWeights.get(t2).compareTo(subTopicWeights.get(t1));
                    if (weightCompare == 0) {
                        return t1.getSequenceOrder().compareTo(t2.getSequenceOrder());
                    }
                    return weightCompare;
                });
            }
            prioritizedTopics.addAll(relevantSubTopics);
        }

        int totalDays = (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        int totalSubTopics = prioritizedTopics.size();

        if (totalSubTopics == 0) throw new RuntimeException("No subtopics found to schedule within the given sequence order!");

        if (totalSubTopics >= totalDays) {
            int topicsPerDay = totalSubTopics / totalDays;
            int remainder = totalSubTopics % totalDays;
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

                for (int j = 0; j < topicsForThisDay && topicIndex < totalSubTopics; j++) {
                    Topic subTopicToAssign = prioritizedTopics.get(topicIndex);
                    subTopicToAssign.setSchedulePerDay(scheduleDay);
                    scheduleDay.getTopics().add(subTopicToAssign);
                    topicIndex++;
                }
                schedule.getSchedulePerDayList().add(scheduleDay);
            }
        }
        else {
            int dayIndex = 0;
            for (int i = 0; i < totalSubTopics; i++) {
                SchedulePerDay scheduleDay = new SchedulePerDay();
                scheduleDay.setDate(request.getStartDate().plusDays(dayIndex));
                scheduleDay.setSchedule(schedule);
                scheduleDay.setTopics(new ArrayList<>());

                Topic subTopicToAssign = prioritizedTopics.get(i);
                subTopicToAssign.setSchedulePerDay(scheduleDay);
                scheduleDay.getTopics().add(subTopicToAssign);

                schedule.getSchedulePerDayList().add(scheduleDay);
                dayIndex++;
            }

            int revisionIndex = 0;
            while (dayIndex < totalDays) {
                SchedulePerDay scheduleDay = new SchedulePerDay();
                scheduleDay.setDate(request.getStartDate().plusDays(dayIndex));
                scheduleDay.setSchedule(schedule);
                scheduleDay.setTopics(new ArrayList<>());

                Topic originalSubTopic = prioritizedTopics.get(revisionIndex % totalSubTopics);
                Topic revisionTopic = new Topic();
                revisionTopic.setTitle("Revision: " + originalSubTopic.getTitle());
                revisionTopic.setDifficulty(originalSubTopic.getDifficulty());
                revisionTopic.setCompleted(false);
                revisionTopic.setUsers(currentUser);
                revisionTopic.setSyllabus(originalSubTopic.getSyllabus());
                revisionTopic.setParentTopic(originalSubTopic.getParentTopic());
                revisionTopic.setSequenceOrder(originalSubTopic.getSequenceOrder() + 1000);

                revisionTopic.setSchedulePerDay(scheduleDay);
                scheduleDay.getTopics().add(revisionTopic);

                schedule.getSchedulePerDayList().add(scheduleDay);

                revisionIndex++;
                dayIndex++;
            }
        }

        Schedule savedSchedule = scheduleRepo.save(schedule);

        if (savedSchedule.getSchedulePerDayList() != null) {
            savedSchedule.getSchedulePerDayList().sort(Comparator.comparing(SchedulePerDay::getDate));
        }

        return savedSchedule;
    }

    private Syllabus cloneSyllabusEntity(Syllabus original, String newTitle, Users currentUser) {
        Syllabus clonedSyllabus = new Syllabus();
        clonedSyllabus.setTitle(newTitle);
        clonedSyllabus.setContentHash(original.getContentHash());
        clonedSyllabus.setUser(currentUser);
        clonedSyllabus.setTopics(new ArrayList<>());
        clonedSyllabus.setForGeneral(false);

        if (original.getTopics() != null) {
            for (Topic originalMainTopic : original.getTopics()) {
                if (originalMainTopic.getParentTopic() != null) continue;

                Topic clonedMainTopic = new Topic();
                clonedMainTopic.setTitle(originalMainTopic.getTitle());
                clonedMainTopic.setDifficulty(originalMainTopic.getDifficulty());
                clonedMainTopic.setCompleted(false);
                clonedMainTopic.setUsers(currentUser);
                clonedMainTopic.setSyllabus(clonedSyllabus);
                clonedMainTopic.setSequenceOrder(originalMainTopic.getSequenceOrder());
                clonedMainTopic.setSubTopics(new ArrayList<>());

                if (originalMainTopic.getSubTopics() != null) {
                    for (Topic originalSubTopic : originalMainTopic.getSubTopics()) {
                        Topic clonedSubTopic = new Topic();
                        clonedSubTopic.setTitle(originalSubTopic.getTitle());
                        clonedSubTopic.setDifficulty(originalSubTopic.getDifficulty());
                        clonedSubTopic.setCompleted(false);
                        clonedSubTopic.setUsers(currentUser);
                        clonedSubTopic.setSyllabus(clonedSyllabus);
                        clonedSubTopic.setSequenceOrder(originalSubTopic.getSequenceOrder());
                        clonedSubTopic.setResources(new ArrayList<>());

                        if (originalSubTopic.getResources() != null) {
                            for (Resources originalResource : originalSubTopic.getResources()) {
                                Resources clonedResource = new Resources();
                                clonedResource.setTitle(originalResource.getTitle());
                                clonedResource.setUrl(originalResource.getUrl());
                                clonedResource.setFallbackQueryUrl(originalResource.getFallbackQueryUrl());
                                clonedResource.setType(originalResource.getType());

                                clonedSubTopic.addResource(clonedResource);
                            }
                        }
                        clonedMainTopic.addSubTopic(clonedSubTopic);
                    }
                }
                clonedSyllabus.getTopics().add(clonedMainTopic);
            }
        }
        return clonedSyllabus;
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

            int startIndex = jsonResponse.indexOf("[");
            int endIndex = jsonResponse.lastIndexOf("]");
            if (startIndex != -1 && endIndex != -1) {
                jsonResponse = jsonResponse.substring(startIndex, endIndex + 1);
            } else {
                throw new RuntimeException("Could not extract valid JSON array from AI response.");
            }

            List<SyllabusResponseDto> parsedDataList = objectMapper.readValue(
                    jsonResponse, new TypeReference<List<SyllabusResponseDto>>() {}
            );

            List<Syllabus> savedSyllabuses = new ArrayList<>();
            int index = 0;

            for (SyllabusResponseDto parsedData : parsedDataList) {
                if (index >= pendingTitles.size()) break;

                Syllabus syllabus = new Syllabus();
                syllabus.setTitle(pendingTitles.get(index));
                syllabus.setContentHash(pendingHashes.get(index));
                syllabus.setUser(currentUser);
                syllabus.setTopics(new ArrayList<>());
                syllabus.setForGeneral(false);

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

                                        // Clean Markdown Links if hallucinated by AI
                                        if(rawURL != null && rawURL.contains("](") && rawURL.endsWith(")")) {
                                            rawURL = rawURL.substring(rawURL.indexOf("](")+2, rawURL.length()-1);
                                        }
                                        if(rawfallBackURL != null && rawfallBackURL.contains("](") && rawfallBackURL.endsWith(")")) {
                                            rawfallBackURL = rawfallBackURL.substring(rawfallBackURL.indexOf("](")+2, rawfallBackURL.length()-1);
                                        }

                                        String safeFallback = (rawfallBackURL != null) ? rawfallBackURL : "https://www.google.com/search?q=" + resDto.getTitle();
                                        resource.setFallbackQueryUrl(safeFallback);

                                        boolean isValid = false;
                                        if (rawURL != null) {
                                            if (rawURL.contains("youtube.com") || rawURL.contains("youtu.be")) {
                                                isValid = oEmbedValidationService.isUrlValid("https://www.youtube.com/oembed", rawURL);
                                            } else {
                                                isValid = articleValidationService.isArticleUrlValid(rawURL);
                                            }
                                        }

                                        resource.setUrl(isValid ? rawURL : safeFallback);

                                        try {
                                            if(resDto.getType() != null) {
                                                resource.setType(Types.valueOf(resDto.getType().toUpperCase()));
                                            } else {
                                                resource.setType(Types.ARTICLE);
                                            }
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
            e.printStackTrace();
            throw new RuntimeException("Failed to generate and save syllabuses: " + e.getMessage(), e);
        }
    }

    private String extractTextFromFile(MultipartFile file) {
        if (file == null || file.isEmpty()) return "";
        try {
            String contentType = file.getContentType();
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

            if ((contentType != null && contentType.contains("pdf")) || filename.endsWith(".pdf")) {
                try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
                    return new PDFTextStripper().getText(doc);
                }
            } else if ((contentType != null && contentType.contains("text")) || filename.endsWith(".txt")) {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            } else {
                return "Unsupported File Uploaded";
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to read file: " + file.getOriginalFilename(), e);
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

    public List<Schedule> getAllSchedules() {
        try {
            Users currentUser = getCurrentUser();
            List<Schedule> schedules = scheduleRepo.findAllByUser(currentUser);

            for (Schedule schedule : schedules) {
                if (schedule.getSchedulePerDayList() != null) {
                    schedule.getSchedulePerDayList().sort(Comparator.comparing(SchedulePerDay::getDate));
                }
            }

            return schedules;
        } catch (Exception e) {
            throw new RuntimeException("Error finding Schedule");
        }
    }

    public Schedule getParticularSchedule(Long id) {
        try {
            Schedule schedule = scheduleRepo.findById(id).orElseThrow(() -> new RuntimeException("Schedule Not Found"));

            if (schedule.getSchedulePerDayList() != null) {
                schedule.getSchedulePerDayList().sort(Comparator.comparing(SchedulePerDay::getDate));
            }

            return schedule;
        } catch (Exception e) {
            throw new RuntimeException("Error finding Schedule");
        }
    }
}