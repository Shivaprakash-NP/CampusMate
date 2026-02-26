package com.collegemate.collegemate.auth;

import com.collegemate.collegemate.auth.dto.AuthResponse;
import com.collegemate.collegemate.auth.dto.LoginRequest;
import com.collegemate.collegemate.auth.dto.SignupRequest;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
// REMOVED @CrossOrigin("*") - Use the Global CorsConfig file instead!
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

    @GetMapping("/me")
    public ResponseEntity<String> checkAuth() {
        // If the request reaches here, the JwtAuthenticationFilter has already validated the token!
        // So we just return 200 OK.
        return ResponseEntity.ok("Authenticated");
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(false) // Must match the creation cookie
                .path("/")     // Must match the creation cookie
                .maxAge(0)     // 0 forces the browser to delete it immediately
                .sameSite("Lax") // Must match the creation cookie
                .build();
                
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().build();
    }

    private void setCookie(HttpServletResponse response, String token) {
        org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .secure(false) // Set to true if using HTTPS
                .path("/")
                .maxAge(24 * 60 * 60)
                .sameSite("Lax") // Essential for cross-origin requests between ports
                .build();
                
        response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
    }
}