package com.collegemate.collegemate.user;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.collegemate.collegemate.auth.dto.UserResponse;

import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/get/{email}")
    public UserResponse getuserr(@PathParam String email) {
        return userService.getUser(email);
    }

}
