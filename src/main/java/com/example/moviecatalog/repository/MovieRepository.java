package com.example.moviecatalog.repository;

import com.example.moviecatalog.model.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    Optional<Movie> findByImdbId(String imdbId);
    Page<Movie> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    boolean existsByImdbId(String imdbId);
}