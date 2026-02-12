package com.collegemate.collegemate.auth;

import org.springframework.stereotype.Service;

import com.collegemate.collegemate.auth.dto.AuthResponse;
import com.collegemate.collegemate.auth.dto.LoginRequest;
import com.collegemate.collegemate.auth.dto.SignupRequest;
import com.collegemate.collegemate.auth.dto.UserResponse;
import com.collegemate.collegemate.user.UserServiceImp;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserServiceImp userServiceImp;
    // name, email, password
    public UserResponse signup(SignupRequest req) {
        return userServiceImp.createUser(req);
    }

    // email, password
    public AuthResponse login(LoginRequest req) {
        
        return null;
    }
}