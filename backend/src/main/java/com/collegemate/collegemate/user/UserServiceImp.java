package com.collegemate.collegemate.user;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.collegemate.collegemate.auth.dto.SignupRequest;
import com.collegemate.collegemate.auth.dto.UserResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImp implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserResponse createUser(SignupRequest req) {
        Users newUser = new Users();

        if(userRepository.existsByEmail(req.email())) {
            throw new RuntimeException("Email Already Exist..");
        }
        newUser.setName(req.name());
        newUser.setEmail(req.email());
        newUser.setPassword(passwordEncoder.encode(req.password()));
        newUser.setCreatedAt(Instant.now());
        newUser.setLastLoginAt(null);

        Users savedUser = userRepository.save(newUser);

        return new UserResponse("dummy", savedUser.getId(), savedUser.getName(), savedUser.getEmail());
    }

    public Users getUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User Not Found"));
    }
}