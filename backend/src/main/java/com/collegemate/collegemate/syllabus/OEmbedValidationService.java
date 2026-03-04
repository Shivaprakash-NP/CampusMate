package com.collegemate.collegemate.syllabus;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
@RequiredArgsConstructor
public class OEmbedValidationService {
    private final RestTemplate restTemplate;

    public boolean isUrlValid(String providerEndpoint, String targetUrl) {
        try {
            URI requestUri = UriComponentsBuilder.fromHttpUrl(providerEndpoint)
                    .queryParam("url", targetUrl)
                    .queryParam("format", "json")
                    .build()
                    .toUri();

            ResponseEntity<String> response = restTemplate.getForEntity(requestUri, String.class);

            return response.getStatusCode() == HttpStatus.OK;
        } catch (HttpClientErrorException e) {
            System.err.println("YouTube URL is invalid or inaccessible. Status: " + e.getStatusCode());
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}