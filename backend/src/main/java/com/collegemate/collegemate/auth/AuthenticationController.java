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
        // Overwrite the cookie with a null one that expires immediately
        Cookie cookie = new Cookie("accessToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Expire immediately
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
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