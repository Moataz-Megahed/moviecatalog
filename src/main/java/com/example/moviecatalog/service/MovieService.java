package com.example.moviecatalog.service;

import com.example.moviecatalog.model.Movie;
import com.example.moviecatalog.model.OmdbResponse;
import com.example.moviecatalog.model.User;
import com.example.moviecatalog.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final OmdbApiService omdbApiService;
    
    @Autowired
    public MovieService(MovieRepository movieRepository, OmdbApiService omdbApiService) {
        this.movieRepository = movieRepository;
        this.omdbApiService = omdbApiService;
    }
    
    // Get all movies with pagination
    public Page<Movie> getAllMovies(Pageable pageable) {
        return movieRepository.findAll(pageable);
    }
    
    // Search movies in database
    public Page<Movie> searchMovies(String searchTerm, Pageable pageable) {
        return movieRepository.findByTitleContainingIgnoreCase(searchTerm, pageable);
    }
    
    // Get movie by ID
    public Optional<Movie> getMovieById(Long id) {
        return movieRepository.findById(id);
    }
    
    // Get movie by IMDB ID
    public Optional<Movie> getMovieByImdbId(String imdbId) {
        return movieRepository.findByImdbId(imdbId);
    }
    
    // Add movie to database
    @Transactional
    public Movie addMovie(String imdbId, User admin) {
        // Check if movie already exists
        Optional<Movie> existingMovie = movieRepository.findByImdbId(imdbId);
        if (existingMovie.isPresent()) {
            return existingMovie.get();
        }
        
        // Fetch movie details from OMDB API
        OmdbResponse omdbResponse = omdbApiService.getMovieDetails(imdbId);
        if (omdbResponse == null || !"True".equalsIgnoreCase(omdbResponse.getResponse())) {
            throw new RuntimeException("Movie not found in OMDB API");
        }
        
        // Convert to Movie entity and save
        Movie movie = omdbResponse.toMovie();
        movie.setAddedBy(admin);
        return movieRepository.save(movie);
    }
    
    // Add multiple movies to database
    @Transactional
    public List<Movie> addMovies(List<String> imdbIds, User admin) {
        return imdbIds.stream()
                .map(imdbId -> addMovie(imdbId, admin))
                .collect(Collectors.toList());
    }
    
    // Remove movie from database
    @Transactional
    public void removeMovie(Long id) {
        movieRepository.deleteById(id);
    }
    
    // Remove multiple movies from database
    @Transactional
    public void removeMovies(List<Long> ids) {
        movieRepository.deleteAllById(ids);
    }
}
