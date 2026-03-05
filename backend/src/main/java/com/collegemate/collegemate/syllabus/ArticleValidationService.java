package com.collegemate.collegemate.syllabus;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Service
public class ArticleValidationService {

    private final RestTemplate restTemplate;

    // OPTIMIZATION 1: Constructor Injection with 3-Second Timeouts
    public ArticleValidationService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(3))
                .setReadTimeout(Duration.ofSeconds(3))
                .build();
    }

    // OPTIMIZATION 2: Cache successful validations
    @Cacheable(value = "articleValidation", key = "#targetUrl", unless = "#result == false")
    public boolean isArticleUrlValid(String targetUrl) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            headers.set("Accept", "text/html,application/xhtml+xml");

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);

            ResponseEntity<Void> response = restTemplate.exchange(
                    targetUrl,
                    HttpMethod.HEAD,
                    requestEntity,
                    Void.class
            );

            return response.getStatusCode().is2xxSuccessful();

        } catch (RestClientException e) {
            // OPTIMIZATION 3: Removed verbose error logging.
            // Catches Timeouts, DNS errors, 404s, and 500s silently and triggers fallback.
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}