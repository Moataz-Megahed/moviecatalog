package com.example.moviecatalog.service;

import com.example.moviecatalog.model.OmdbResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class OmdbApiService {
    private static final Logger logger = LoggerFactory.getLogger(OmdbApiService.class);

    @Value("${omdb.api.key}")
    private String apiKey;
    
    @Value("${omdb.api.base-url}")
    private String apiUrl;
    
    private final RestTemplate restTemplate;
    
    public OmdbApiService() {
        this.restTemplate = new RestTemplate();
    }
    
    // Search movies by title
    public List<OmdbResponse> searchMovies(String searchTerm, int page) {
        try {
            logger.info("Searching OMDB for: '{}' (page {})", searchTerm, page);
            
            // Simplify search term if it's too specific
            String simplifiedSearchTerm = searchTerm;
            if (searchTerm.contains("Vol.") || searchTerm.contains("Part")) {
                // For sequels, just use the main title for better results
                simplifiedSearchTerm = searchTerm.replaceAll("Vol\\..*$", "").replaceAll("Part.*$", "").trim();
                logger.info("Simplified search term from '{}' to '{}'", searchTerm, simplifiedSearchTerm);
            }
            
            // Construct the URL according to the API documentation
            String url = apiUrl + "?apikey=" + apiKey + "&s=" + simplifiedSearchTerm + "&type=movie&page=" + page;
            logger.info("OMDB API search URL: {}", url);
            
            // Make a direct test call to verify the API is working
            String testUrl = apiUrl + "?i=tt3896198&apikey=" + apiKey;
            logger.info("Testing OMDB API with URL: {}", testUrl);
            Object testResponse = restTemplate.getForObject(testUrl, Object.class);
            logger.info("Test response: {}", testResponse);
            
            // Now make the actual search call
            SearchResults results = restTemplate.getForObject(url, SearchResults.class);
            
            if (results == null) {
                logger.warn("Null response from OMDB API");
                return Collections.emptyList();
            }
            
            logger.info("OMDB API response: {}", results.getResponse());
            if (results.getError() != null) {
                logger.warn("OMDB API error: {}", results.getError());
            }
            
            if (!"True".equals(results.getResponse())) {
                logger.warn("OMDB API returned error: {}", results.getError());
                return Collections.emptyList();
            }
            
            if (results.getSearch() == null) {
                logger.warn("No search results returned from OMDB API");
                return Collections.emptyList();
            }
            
            logger.info("Found {} results from OMDB API", results.getSearch().length);
            return Arrays.asList(results.getSearch());
        } catch (RestClientException e) {
            logger.error("Error calling OMDB API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to search OMDB API", e);
        }
    }
    
    // Search movies by title using direct HTTP connection
    public List<OmdbResponse> searchMoviesDirectHttp(String searchTerm, int page) {
        try {
            logger.info("Searching OMDB with direct HTTP for: '{}' (page {})", searchTerm, page);
            
            // Simplify search term if it's too specific
            String simplifiedSearchTerm = searchTerm;
            if (searchTerm.contains("Vol.") || searchTerm.contains("Part")) {
                // For sequels, just use the main title for better results
                simplifiedSearchTerm = searchTerm.replaceAll("Vol\\..*$", "").replaceAll("Part.*$", "").trim();
                logger.info("Simplified search term from '{}' to '{}'", searchTerm, simplifiedSearchTerm);
            }
            
            // URL encode the search term
            String encodedSearchTerm = java.net.URLEncoder.encode(simplifiedSearchTerm, "UTF-8");
            
            // Construct the URL
            String urlString = apiUrl + "?apikey=" + apiKey + "&s=" + encodedSearchTerm + "&type=movie&page=" + page;
            logger.info("OMDB API direct HTTP URL: {}", urlString);
            
            // Create URL and open connection
            java.net.URL url = new java.net.URL(urlString);
            java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            
            // Get response code
            int responseCode = connection.getResponseCode();
            logger.info("OMDB API response code: {}", responseCode);
            
            if (responseCode == 200) {
                // Read the response
                java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(connection.getInputStream()));
                
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                
                // Log the raw response
                logger.info("OMDB API raw response: {}", response.toString());
                
                // Parse the response
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                SearchResults results = mapper.readValue(response.toString(), SearchResults.class);
                
                if (results == null) {
                    logger.warn("Null response from OMDB API");
                    return Collections.emptyList();
                }
                
                logger.info("OMDB API response: {}", results.getResponse());
                if (results.getError() != null) {
                    logger.warn("OMDB API error: {}", results.getError());
                }
                
                if (!"True".equals(results.getResponse())) {
                    logger.warn("OMDB API returned error: {}", results.getError());
                    return Collections.emptyList();
                }
                
                if (results.getSearch() == null) {
                    logger.warn("No search results returned from OMDB API");
                    return Collections.emptyList();
                }
                
                logger.info("Found {} results from OMDB API", results.getSearch().length);
                return Arrays.asList(results.getSearch());
            } else {
                logger.warn("OMDB API returned error code: {}", responseCode);
                return Collections.emptyList();
            }
        } catch (Exception e) {
            logger.error("Error calling OMDB API with direct HTTP: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to search OMDB API with direct HTTP", e);
        }
    }
    
    // Get movie details by IMDB ID
    public OmdbResponse getMovieDetails(String imdbId) {
        try {
            logger.info("Getting OMDB details for IMDB ID: {}", imdbId);
            
            // Construct the URL according to the API documentation
            String url = apiUrl + "?apikey=" + apiKey + "&i=" + imdbId + "&plot=full";
            logger.info("OMDB API details URL: {}", url);
            
            OmdbResponse response = restTemplate.getForObject(url, OmdbResponse.class);
            
            if (response == null) {
                logger.warn("Null response from OMDB API");
                throw new RuntimeException("Failed to get movie details from OMDB API");
            }
            
            logger.info("OMDB API response: {}", response.getResponse());
            if (response.getError() != null) {
                logger.warn("OMDB API error: {}", response.getError());
            }
            
            if (!"True".equals(response.getResponse())) {
                logger.warn("OMDB API returned error for IMDB ID {}: {}", imdbId, response.getError());
                throw new RuntimeException("OMDB API error: " + response.getError());
            }
            
            return response;
        } catch (RestClientException e) {
            logger.error("Error calling OMDB API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get movie details from OMDB API", e);
        }
    }
    
    // Getter for API key (used for testing)
    public String getApiKey() {
        return apiKey;
    }
    
    // Getter for API URL (used for testing)
    public String getApiUrl() {
        return apiUrl;
    }
    
    // Class to handle search results
    private static class SearchResults {
        @JsonProperty("Search")
        private OmdbResponse[] search;
        
        @JsonProperty("totalResults")
        private String totalResults;
        
        @JsonProperty("Response")
        private String response;
        
        @JsonProperty("Error")
        private String error;
        
        public OmdbResponse[] getSearch() {
            return search;
        }
        
        public void setSearch(OmdbResponse[] search) {
            this.search = search;
        }
        
        public String getTotalResults() {
            return totalResults;
        }
        
        public void setTotalResults(String totalResults) {
            this.totalResults = totalResults;
        }
        
        public String getResponse() {
            return response;
        }
        
        public void setResponse(String response) {
            this.response = response;
        }
        
        public String getError() {
            return error;
        }
        
        public void setError(String error) {
            this.error = error;
        }
    }
    
    // Search movies by title - simplified version based on direct testing
    public List<OmdbResponse> searchMoviesSimple(String searchTerm, int page) {
        try {
            logger.info("Simple searching OMDB for: '{}' (page {})", searchTerm, page);
            
            // URL encode the search term
            String encodedSearchTerm = java.net.URLEncoder.encode(searchTerm, "UTF-8");
            
            // Construct the URL - use 's' parameter for search
            String url = apiUrl + "?apikey=" + apiKey + "&s=" + encodedSearchTerm + "&type=movie&page=" + page;
            logger.info("OMDB API simple search URL: {}", url);
            
            // Make the request
            String responseJson = makeHttpRequest(url);
            
            // Parse the response
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            SearchResults results = mapper.readValue(responseJson, SearchResults.class);
            
            if (results == null) {
                logger.warn("Null response from OMDB API");
                return Collections.emptyList();
            }
            
            if (!"True".equals(results.getResponse())) {
                logger.warn("OMDB API returned error: {}", results.getError());
                return Collections.emptyList();
            }
            
            if (results.getSearch() == null) {
                logger.warn("No search results returned from OMDB API");
                return Collections.emptyList();
            }
            
            logger.info("Found {} results from OMDB API", results.getSearch().length);
            
            // If searching for a sequel, try to find an exact match
            if (searchTerm.contains("Vol.") || searchTerm.contains("Part")) {
                for (OmdbResponse movie : results.getSearch()) {
                    if (movie.getTitle().toLowerCase().contains(searchTerm.toLowerCase())) {
                        logger.info("Found exact match for sequel: {}", movie.getTitle());
                        return Collections.singletonList(movie);
                    }
                }
            }
            
            return Arrays.asList(results.getSearch());
        } catch (Exception e) {
            logger.error("Error in simple OMDB API search: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to search OMDB API", e);
        }
    }
    
    // Get movie details by title - useful for exact title matches
    public OmdbResponse getMovieDetailsByTitle(String title) {
        try {
            logger.info("Getting OMDB details for title: {}", title);
            
            // URL encode the title
            String encodedTitle = java.net.URLEncoder.encode(title, "UTF-8");
            
            // Construct the URL - use 't' parameter for exact title match
            String url = apiUrl + "?apikey=" + apiKey + "&t=" + encodedTitle;
            logger.info("OMDB API title details URL: {}", url);
            
            // Make the request
            String responseJson = makeHttpRequest(url);
            
            // Parse the response
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            OmdbResponse response = mapper.readValue(responseJson, OmdbResponse.class);
            
            if (response == null) {
                logger.warn("Null response from OMDB API");
                throw new RuntimeException("Failed to get movie details from OMDB API");
            }
            
            if (!"True".equals(response.getResponse())) {
                logger.warn("OMDB API returned error for title {}: {}", title, response.getError());
                throw new RuntimeException("OMDB API error: " + response.getError());
            }
            
            return response;
        } catch (Exception e) {
            logger.error("Error getting movie details by title: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get movie details from OMDB API", e);
        }
    }
    
    // Helper method to make HTTP requests
    private String makeHttpRequest(String urlString) throws Exception {
        // Create URL and open connection
        java.net.URL url = new java.net.URL(urlString);
        java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        
        // Get response code
        int responseCode = connection.getResponseCode();
        logger.info("OMDB API response code: {}", responseCode);
        
        if (responseCode == 200) {
            // Read the response
            java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(connection.getInputStream()));
            
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();
            
            String responseJson = response.toString();
            logger.debug("OMDB API raw response: {}", responseJson);
            return responseJson;
        } else {
            throw new RuntimeException("HTTP error code: " + responseCode);
        }
    }
}
