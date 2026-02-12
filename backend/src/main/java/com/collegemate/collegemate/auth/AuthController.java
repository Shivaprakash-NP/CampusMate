package com.collegemate.collegemate.auth;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.collegemate.collegemate.auth.dto.AuthResponse;
import com.collegemate.collegemate.auth.dto.LoginRequest;
import com.collegemate.collegemate.auth.dto.SignupRequest;
import com.collegemate.collegemate.auth.dto.UserResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins="*")
@RequiredArgsConstructor
public class AuthController {
    private final AuthServiceImpl authService;

    //signup (first time)
    @PostMapping("/signup")
    public UserResponse signup(@RequestBody SignupRequest req) {
        return authService.signup(req);
    }

    //login (after creating the account)
    @PostMapping("/login") 
    public AuthResponse login(@RequestBody LoginRequest req) {
        return authService.login(req);
    }
}
