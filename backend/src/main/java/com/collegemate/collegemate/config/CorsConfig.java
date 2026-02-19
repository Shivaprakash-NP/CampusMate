package com.collegemate.collegemate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // 1. Allow your Frontend URL 
        // IMPORTANT: Change this to match your React port! (e.g. 3000 or 5173)
        // You CANNOT use "*" here if you want cookies to work.
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000")); 
        
        // 2. Allow Cookies (CRITICAL)
        // This tells the browser: "It's okay to send/receive cookies with this backend"
        config.setAllowCredentials(true); 
        
        // 3. Allow Headers
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        
        // 4. Allow Methods
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}