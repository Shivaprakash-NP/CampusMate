package com.collegemate.collegemate.auth;

import com.collegemate.collegemate.auth.dto.AuthResponse;
import com.collegemate.collegemate.auth.dto.LoginRequest;
import com.collegemate.collegemate.auth.dto.SignupRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
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
            @RequestBody SignupRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = service.register(request);
        setCookie(response, authResponse.getToken());
        
        return ResponseEntity.ok(AuthResponse.builder().token(null).build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(
            @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = service.authenticate(request);
        setCookie(response, authResponse.getToken());
        
        return ResponseEntity.ok(AuthResponse.builder().token(null).build());
    }

    private void setCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("accessToken", token);
        cookie.setHttpOnly(true); 
        cookie.setSecure(false);  
        cookie.setPath("/");       
        cookie.setMaxAge(24 * 60 * 60); 
        
        response.addCookie(cookie);
    }
}