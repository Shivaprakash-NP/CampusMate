package com.collegemate.collegemate.syllabus;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;

@Service
public class OEmbedValidationService {

    private final RestTemplate restTemplate;

    public OEmbedValidationService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .connectTimeout(Duration.ofSeconds(3))
                .readTimeout(Duration.ofSeconds(3))
                .build();
    }

    @Cacheable(value = "youtubeValidation", key = "#targetUrl", unless = "#result == false")
    public boolean isUrlValid(String providerEndpoint, String targetUrl) {
        try {
            URI requestUri = UriComponentsBuilder.fromHttpUrl(providerEndpoint)
                    .queryParam("url", targetUrl)
                    .queryParam("format", "json")
                    .build()
                    .toUri();

            ResponseEntity<String> response = restTemplate.getForEntity(requestUri, String.class);

            return response.getStatusCode() == HttpStatus.OK;

        } catch (RestClientException e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}