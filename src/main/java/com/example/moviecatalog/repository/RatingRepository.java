package com.example.moviecatalog.repository;

import com.example.moviecatalog.model.Rating;
import com.example.moviecatalog.model.Movie;
import com.example.moviecatalog.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUserAndMovie(User user, Movie movie);
}