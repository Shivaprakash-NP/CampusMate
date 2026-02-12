package com.collegemate.collegemate.auth;

import com.collegemate.collegemate.auth.dto.AuthResponse;
import com.collegemate.collegemate.auth.dto.LoginRequest;
import com.collegemate.collegemate.auth.dto.SignupRequest;
import com.collegemate.collegemate.auth.dto.UserResponse;

public interface AuthService {
    public UserResponse signup(SignupRequest req);
    public AuthResponse login(LoginRequest req);
}
