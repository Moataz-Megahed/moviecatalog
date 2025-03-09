package com.example.moviecatalog.service;

import com.example.moviecatalog.model.Movie;
import com.example.moviecatalog.model.Rating;
import com.example.moviecatalog.model.User;
import com.example.moviecatalog.repository.MovieRepository;
import com.example.moviecatalog.repository.RatingRepository;
import com.example.moviecatalog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;
    
    @Autowired
    public RatingService(RatingRepository ratingRepository, UserRepository userRepository, MovieRepository movieRepository) {
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
    }
    
    @Transactional
    public Rating rateMovie(Long userId, Long movieId, Integer ratingValue, String comment) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        // Check if user already rated this movie
        Optional<Rating> existingRating = ratingRepository.findByUserAndMovie(user, movie);
        
        Rating rating;
        if (existingRating.isPresent()) {
            // Update existing rating
            rating = existingRating.get();
            rating.setRating(ratingValue);
            rating.setComment(comment);
        } else {
            // Create new rating
            rating = new Rating();
            rating.setUser(user);
            rating.setMovie(movie);
            rating.setRating(ratingValue);
            rating.setComment(comment);
        }
        
        return ratingRepository.save(rating);
    }
    
    public Optional<Rating> getUserRating(Long userId, Long movieId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found"));
        
        return ratingRepository.findByUserAndMovie(user, movie);
    }
}
