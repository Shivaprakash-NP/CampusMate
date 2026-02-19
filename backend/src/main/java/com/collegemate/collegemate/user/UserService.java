package com.collegemate.collegemate.user;

import com.collegemate.collegemate.auth.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

        public UserResponse getUser(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        return new UserResponse(
            "dummy", 
            user.getId(), 
            user.getName(), 
            user.getEmail()
        );
    }
}