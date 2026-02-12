package com.collegemate.collegemate.user;

import com.collegemate.collegemate.auth.dto.SignupRequest;
import com.collegemate.collegemate.auth.dto.UserResponse;

public interface UserService {
    public UserResponse createUser(SignupRequest user);
    public Users getUser(Long userId);
}
