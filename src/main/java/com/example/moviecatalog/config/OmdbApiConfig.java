// OMDB API Configuration
package com.example.moviecatalog.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Configuration
public class OmdbApiConfig {
    @Value("${omdb.api.key}")
    private String apiKey;

    @Value("${omdb.api.base-url}")
    private String baseUrl;

    @Bean
    public WebClient omdbWebClient() {
        return WebClient.builder()
                .baseUrl(baseUrl + "?apikey=" + apiKey)
                .build();
    }
}