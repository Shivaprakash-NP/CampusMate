package com.collegemate.collegemate.syllabus;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ArticleValidationService {
    private final RestTemplate restTemplate;

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

        } catch (HttpClientErrorException e) {
            System.err.println("Article URL is invalid (Client Error). Status: " + e.getStatusCode() + " - URL: " + targetUrl);
            return false;
        } catch (HttpServerErrorException e) {
            System.err.println("Article server is currently down. Status: " + e.getStatusCode() + " - URL: " + targetUrl);
            return false;
        } catch (ResourceAccessException e) {
            System.err.println("Could not connect to the article server (Timeout/DNS). URL: " + targetUrl);
            return false;
        } catch (Exception e) {
            System.err.println("Unexpected error validating article URL: " + e.getMessage());
            return false;
        }
    }
}