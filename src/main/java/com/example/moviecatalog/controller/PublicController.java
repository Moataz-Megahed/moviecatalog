package com.example.moviecatalog.controller;

import com.example.moviecatalog.model.Movie;
import com.example.moviecatalog.model.OmdbResponse;
import com.example.moviecatalog.service.MovieService;
import com.example.moviecatalog.service.OmdbApiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private static final Logger logger = LoggerFactory.getLogger(PublicController.class);

    @Autowired
    private OmdbApiService omdbApiService;
    
    @Autowired
    private MovieService movieService;

    // Public test endpoint for OMDB API
    @GetMapping("/omdb/test")
    public ResponseEntity<?> testOmdbApi(@RequestParam(defaultValue = "Guardians of the Galaxy") String title) {
        try {
            logger.info("Public testing OMDB API with title: {}", title);
            
            String url = "http://www.omdbapi.com/?apikey=" + omdbApiService.getApiKey() + "&s=" + title + "&type=movie";
            logger.info("Direct OMDB API URL: {}", url);
            
            RestTemplate restTemplate = new RestTemplate();
            Object response = restTemplate.getForObject(url, Object.class);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error testing OMDB API: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to test OMDB API: " + e.getMessage()));
        }
    }
    
    // Public endpoint to search OMDB API for movies
    @GetMapping("/omdb/search")
    public ResponseEntity<?> searchOmdb(@RequestParam String title, @RequestParam(defaultValue = "1") int page) {
        try {
            logger.info("Public searching OMDB for title: '{}' (page: {})", title, page);
            List<OmdbResponse> results = omdbApiService.searchMovies(title, page);
            logger.info("OMDB search results count: {}", results.size());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error searching OMDB: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search OMDB: " + e.getMessage()));
        }
    }
    
    // Public endpoint to get movie details from OMDB API
    @GetMapping("/omdb/details/{imdbId}")
    public ResponseEntity<?> getOmdbDetails(@PathVariable String imdbId) {
        try {
            logger.info("Public getting OMDB details for IMDB ID: {}", imdbId);
            OmdbResponse movie = omdbApiService.getMovieDetails(imdbId);
            return ResponseEntity.ok(movie);
        } catch (Exception e) {
            logger.error("Error getting OMDB details: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get movie details: " + e.getMessage()));
        }
    }
    
    // Test endpoint for OMDB API with a hardcoded search term
    @GetMapping("/omdb/test-guardians")
    public ResponseEntity<?> testGuardiansSearch() {
        try {
            logger.info("Testing OMDB API with hardcoded search term: 'Guardians of the Galaxy Vol. 2'");
            
            String apiKey = omdbApiService.getApiKey();
            String apiUrl = omdbApiService.getApiUrl();
            String searchTerm = "Guardians of the Galaxy Vol. 2";
            
            // Try different search terms
            String[] searchTerms = {
                "Guardians",
                "Guardians of the Galaxy",
                "Guardians+of+the+Galaxy",
                "Guardians%20of%20the%20Galaxy",
                "Guardians of the Galaxy Vol. 2",
                "Guardians+of+the+Galaxy+Vol.+2",
                "Guardians%20of%20the%20Galaxy%20Vol.%202"
            };
            
            Map<String, Object> results = new HashMap<>();
            
            for (String term : searchTerms) {
                String url = apiUrl + "?apikey=" + apiKey + "&s=" + term + "&type=movie";
                logger.info("Testing URL: {}", url);
                
                RestTemplate restTemplate = new RestTemplate();
                Object response = restTemplate.getForObject(url, Object.class);
                
                results.put(term, response);
            }
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error testing OMDB API: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to test OMDB API: " + e.getMessage()));
        }
    }
    
    // Direct test endpoint for OMDB API using the provided API key
    @GetMapping("/omdb/direct-test")
    public ResponseEntity<?> directTestOmdbApi() {
        try {
            logger.info("Direct testing OMDB API with the provided API key");
            
            String apiKey = omdbApiService.getApiKey();
            String apiUrl = omdbApiService.getApiUrl();
            
            // Test with a known IMDB ID (Guardians of the Galaxy Vol. 2)
            String url = apiUrl + "?i=tt3896198&apikey=" + apiKey;
            logger.info("Direct OMDB API URL: {}", url);
            
            RestTemplate restTemplate = new RestTemplate();
            Object response = restTemplate.getForObject(url, Object.class);
            
            return ResponseEntity.ok(Map.of(
                "url", url,
                "response", response
            ));
        } catch (Exception e) {
            logger.error("Error testing OMDB API: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to test OMDB API: " + e.getMessage()));
        }
    }
    
    // Direct curl test endpoint for OMDB API
    @GetMapping("/omdb/curl-test")
    public ResponseEntity<?> curlTestOmdbApi(@RequestParam(defaultValue = "Guardians of the Galaxy") String title) {
        try {
            logger.info("Testing OMDB API with curl for title: {}", title);
            
            // Encode the title for URL
            String encodedTitle = java.net.URLEncoder.encode(title, "UTF-8");
            String apiKey = omdbApiService.getApiKey();
            
            // Create the curl command
            String curlCommand = String.format("curl -X GET \"http://www.omdbapi.com/?s=%s&apikey=%s&type=movie\"", 
                                              encodedTitle, apiKey);
            logger.info("Curl command: {}", curlCommand);
            
            // Execute the curl command
            Process process = Runtime.getRuntime().exec(curlCommand);
            
            // Read the output
            java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(process.getInputStream()));
            
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }
            
            // Wait for the process to complete
            int exitCode = process.waitFor();
            logger.info("Curl exit code: {}", exitCode);
            
            // Return the output
            return ResponseEntity.ok(Map.of(
                "command", curlCommand,
                "exitCode", exitCode,
                "output", output.toString()
            ));
        } catch (Exception e) {
            logger.error("Error testing OMDB API with curl: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to test OMDB API with curl: " + e.getMessage()));
        }
    }
    
    // Get all movies with pagination
    @GetMapping("/movies")
    public ResponseEntity<Page<Movie>> getAllMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("asc") ? 
                Sort.by(sortBy).ascending() : 
                Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Movie> movies = movieService.getAllMovies(pageable);
        return ResponseEntity.ok(movies);
    }
    
    // Search movies by title
    @GetMapping("/movies/search")
    public ResponseEntity<Page<Movie>> searchMovies(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Movie> movies = movieService.searchMovies(title, pageable);
        return ResponseEntity.ok(movies);
    }
    
    // Get movie by ID
    @GetMapping("/movies/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        return movieService.getMovieById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Search OMDB API using direct HTTP implementation
    @GetMapping("/omdb/direct-search")
    public ResponseEntity<?> directSearchOmdb(@RequestParam String title, @RequestParam(defaultValue = "1") int page) {
        try {
            logger.info("Direct HTTP searching OMDB for title: '{}' (page: {})", title, page);
            List<OmdbResponse> results = omdbApiService.searchMoviesDirectHttp(title, page);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error searching OMDB with direct HTTP: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search OMDB with direct HTTP: " + e.getMessage()));
        }
    }

    // Search OMDB API using simplified method
    @GetMapping("/omdb/simple-search")
    public ResponseEntity<?> simpleSearchOmdb(@RequestParam String title, @RequestParam(defaultValue = "1") int page) {
        try {
            logger.info("Simple searching OMDB for title: '{}' (page: {})", title, page);
            List<OmdbResponse> results = omdbApiService.searchMoviesSimple(title, page);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error in simple OMDB search: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed in simple OMDB search: " + e.getMessage()));
        }
    }
    
    // Get movie details by title
    @GetMapping("/omdb/title/{title}")
    public ResponseEntity<?> getOmdbDetailsByTitle(@PathVariable String title) {
        try {
            logger.info("Getting OMDB details for title: '{}'", title);
            OmdbResponse movie = omdbApiService.getMovieDetailsByTitle(title);
            return ResponseEntity.ok(movie);
        } catch (Exception e) {
            logger.error("Error getting OMDB details by title: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get movie details by title: " + e.getMessage()));
        }
    }
} 