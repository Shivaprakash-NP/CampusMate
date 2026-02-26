package com.collegemate.collegemate.Chat;

import com.collegemate.collegemate.Chat.dto.ChatDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class CharController {
    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<?> doChat(@RequestBody ChatDto chatReq) {
        return chatService.chat(chatReq);
    }
}
