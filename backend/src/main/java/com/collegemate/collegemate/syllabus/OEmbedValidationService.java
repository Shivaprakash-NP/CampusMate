package com.collegemate.collegemate.syllabus;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class OEmbedValidationService {
    private final RestTemplate restTemplate;

    public boolean isUrlValid(String providerEndpoint, String targetUrl) {
        try {
            String requestUri = UriComponentsBuilder.fromHttpUrl(providerEndpoint)
                    .queryParam("url", targetUrl)
                    .queryParam("format", "json")
                    .toUriString();

            ResponseEntity<String> response = restTemplate.getForEntity(requestUri, String.class);

            return response.getStatusCode() == HttpStatus.OK;

        } catch (HttpClientErrorException e) {
            System.err.println("URL is invalid or inaccessible. Status: " + e.getStatusCode());
            return false;
        } catch (Exception e) {
            System.err.println("Error communicating with oEmbed provider: " + e.getMessage());
            return false;
        }
    }
}