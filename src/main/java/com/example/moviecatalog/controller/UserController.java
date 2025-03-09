package com.example.moviecatalog.controller;

import com.example.moviecatalog.model.Movie;
import com.example.moviecatalog.model.Rating;
import com.example.moviecatalog.model.User;
import com.example.moviecatalog.service.MovieService;
import com.example.moviecatalog.service.RatingService;
import com.example.moviecatalog.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final MovieService movieService;
    private final RatingService ratingService;
    private final UserService userService;

    /**
     * Get all movies with pagination
     * @param pageable Pagination information
     * @return Page of movies
     */
    @GetMapping("/movies")
    public ResponseEntity<Page<Movie>> getAllMovies(Pageable pageable) {
        return ResponseEntity.ok(movieService.getAllMovies(pageable));
    }

    /**
     * Search movies with pagination
     * @param searchTerm Search query
     * @param pageable Pagination information
     * @return Page of matching movies
     */
    @GetMapping("/movies/search")
    public ResponseEntity<Page<Movie>> searchMovies(
            @RequestParam String searchTerm,
            Pageable pageable
    ) {
        return ResponseEntity.ok(movieService.searchMovies(searchTerm, pageable));
    }

    /**
     * Get movie details by ID
     * @param movieId Movie ID
     * @return Movie details
     */
    @GetMapping("/movies/{movieId}")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long movieId) {
        Optional<Movie> movie = movieService.getMovieById(movieId);
        return movie.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Rate a movie
     * @param movieId Movie ID
     * @param ratingValue Rating value
     * @param comment Optional comment
     * @return Created or updated rating
     */
    @PostMapping("/movies/{movieId}/rate")
    public ResponseEntity<Rating> rateMovie(
            @PathVariable Long movieId,
            @RequestParam Integer ratingValue,
            @RequestParam(required = false) String comment
    ) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByUsername(authentication.getName());

        // Rate the movie
        Rating rating = ratingService.rateMovie(currentUser.getId(), movieId, ratingValue, comment);
        return ResponseEntity.ok(rating);
    }

    /**
     * Get user's rating for a specific movie
     * @param movieId Movie ID
     * @return User's rating for the movie
     */
    @GetMapping("/movies/{movieId}/rating")
    public ResponseEntity<Rating> getUserRatingForMovie(@PathVariable Long movieId) {
        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userService.findByUsername(authentication.getName());

        Optional<Rating> rating = ratingService.getUserRating(currentUser.getId(), movieId);
        return rating.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}