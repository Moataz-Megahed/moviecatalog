package com.example.moviecatalog.controller;

import com.example.moviecatalog.model.Movie;
import com.example.moviecatalog.model.OmdbResponse;
import com.example.moviecatalog.model.User;
import com.example.moviecatalog.repository.UserRepository;
import com.example.moviecatalog.service.MovieService;
import com.example.moviecatalog.service.OmdbApiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private OmdbApiService omdbApiService;
    
    @Autowired
    private MovieService movieService;
    
    @Autowired
    private UserRepository userRepository;

    // Search OMDB API for movies
    @GetMapping("/omdb/search")
    public ResponseEntity<?> searchOmdb(@RequestParam String title, @RequestParam(defaultValue = "1") int page) {
        try {
            logger.info("Searching OMDB for title: {} (page: {})", title, page);
            List<OmdbResponse> results = omdbApiService.searchMovies(title, page);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error searching OMDB: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search OMDB: " + e.getMessage()));
        }
    }
    
    // Get movie details from OMDB API
    @GetMapping("/omdb/details/{imdbId}")
    public ResponseEntity<?> getOmdbDetails(@PathVariable String imdbId) {
        try {
            logger.info("Getting OMDB details for IMDB ID: {}", imdbId);
            OmdbResponse movie = omdbApiService.getMovieDetails(imdbId);
            return ResponseEntity.ok(movie);
        } catch (Exception e) {
            logger.error("Error getting OMDB details: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get movie details: " + e.getMessage()));
        }
    }
    
    // Add a movie to the database
    @PostMapping("/movies")
    public ResponseEntity<?> addMovie(@RequestBody Map<String, String> request) {
        try {
            String imdbId = request.get("imdbId");
            if (imdbId == null || imdbId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "IMDB ID is required"));
            }
            
            logger.info("Adding movie with IMDB ID: {}", imdbId);
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User admin = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Movie movie = movieService.addMovie(imdbId, admin);
            return ResponseEntity.ok(movie);
        } catch (Exception e) {
            logger.error("Error adding movie: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add movie: " + e.getMessage()));
        }
    }
    
    // Add multiple movies to the database (batch operation)
    @PostMapping("/movies/batch")
    public ResponseEntity<?> addMoviesBatch(@RequestBody List<String> imdbIds) {
        try {
            if (imdbIds == null || imdbIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "IMDB IDs are required"));
            }
            
            logger.info("Adding {} movies in batch", imdbIds.size());
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            User admin = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<Movie> movies = movieService.addMovies(imdbIds, admin);
            return ResponseEntity.ok(movies);
        } catch (Exception e) {
            logger.error("Error adding movies in batch: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add movies: " + e.getMessage()));
        }
    }
    
    // Remove a movie from the database
    @DeleteMapping("/movies/{id}")
    public ResponseEntity<?> removeMovie(@PathVariable Long id) {
        try {
            logger.info("Removing movie with ID: {}", id);
            movieService.removeMovie(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error removing movie: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to remove movie: " + e.getMessage()));
        }
    }
    
    // Remove multiple movies from the database (batch operation)
    @DeleteMapping("/movies/batch")
    public ResponseEntity<?> removeMoviesBatch(@RequestBody List<Long> ids) {
        try {
            logger.info("Removing {} movies in batch", ids.size());
            movieService.removeMovies(ids);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error removing movies in batch: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to remove movies: " + e.getMessage()));
        }
    }

    // Test OMDB API directly
    @GetMapping("/omdb/test")
    public ResponseEntity<?> testOmdbApi(@RequestParam(defaultValue = "Guardians of the Galaxy") String title) {
        try {
            logger.info("Testing OMDB API with title: {}", title);
            
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
}
