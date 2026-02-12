package com.collegemate.collegemate.auth.dto;

public record UserResponse(String token, Long userId, String name, String email) {}
