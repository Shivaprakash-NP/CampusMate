package com.collegemate.collegemate.auth;

import com.collegemate.collegemate.auth.dto.AuthResponse;
import com.collegemate.collegemate.auth.dto.LoginRequest;
import com.collegemate.collegemate.auth.dto.SignupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/signup") 
    public ResponseEntity<AuthResponse> register(
            @RequestBody SignupRequest request
    ) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login") 
    public ResponseEntity<AuthResponse> authenticate(
            @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}