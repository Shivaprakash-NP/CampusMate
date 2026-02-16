package com.collegemate.collegemate.resource;

import java.util.List;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResSerImp implements ResService {
    public final ChatClient chatClient;

    public String getTopicsFromSyllubus(String syllabus) {

        String prompt =
                "Extract all the topics from the following syllabus.\n" +
                "Return only a JSON array of strings.\n" +
                "No explanation.\n\n" +
                "Syllabus:\n" +
                syllabus;

        System.out.println(syllabus);
        
        String ans = chatClient.prompt().user(prompt).call().content();

        return ans;
    }
}
