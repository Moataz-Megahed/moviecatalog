package com.example.moviecatalog.controller;

import com.example.moviecatalog.model.Movie;
import com.example.moviecatalog.model.Rating;
import com.example.moviecatalog.model.User;
import com.example.moviecatalog.repository.UserRepository;
import com.example.moviecatalog.service.MovieService;
import com.example.moviecatalog.service.RatingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Autowired
    private MovieService movieService;
    
    @Autowired
    private RatingService ratingService;
    
    @Autowired
    private UserRepository userRepository;

    // Get all movies with pagination
    @GetMapping
    public ResponseEntity<Page<Movie>> getAllMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<Movie> movies = movieService.getAllMovies(pageable);
        
        return ResponseEntity.ok(movies);
    }
    
    // Search movies
    @GetMapping("/search")
    public ResponseEntity<Page<Movie>> searchMovies(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Movie> movies = movieService.searchMovies(title, pageable);
        
        return ResponseEntity.ok(movies);
    }
    
    // Get movie by ID
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id) {
        Optional<Movie> movie = movieService.getMovieById(id);
        return movie.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Rate a movie
    @PostMapping("/{id}/rate")
    public ResponseEntity<?> rateMovie(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Integer ratingValue = (Integer) request.get("rating");
        String comment = (String) request.get("comment");
        
        if (ratingValue == null || ratingValue < 1 || ratingValue > 5) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Rating must be between 1 and 5"));
        }
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Rating rating = ratingService.rateMovie(user.getId(), id, ratingValue, comment);
        return ResponseEntity.ok(rating);
    }
    
    // Inner class for message responses
    private static class MessageResponse {
        private String message;
        
        public MessageResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}
