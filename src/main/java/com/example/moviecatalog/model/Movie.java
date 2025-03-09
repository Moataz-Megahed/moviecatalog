package com.example.moviecatalog.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "movies")
public class Movie {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "imdb_id", nullable = false, unique = true)
    private String imdbId;
    
    @Column(nullable = false)
    private String title;
    
    private String year;
    
    @Column(name = "poster_url")
    private String posterUrl;
    
    @Column(columnDefinition = "TEXT")
    private String plot;
    
    private String director;
    
    @Column(columnDefinition = "TEXT")
    private String actors;
    
    private String genre;
    
    private String runtime;
    
    private String rated;
    
    private String released;
    
    @Column(columnDefinition = "TEXT")
    private String writer;
    
    private String language;
    
    private String country;
    
    private String awards;
    
    @Column(name = "imdb_rating")
    private String imdbRating;
    
    private String type;
    
    @ManyToOne
    @JoinColumn(name = "added_by")
    private User addedBy;
    
    @Column(name = "added_at")
    private LocalDateTime addedAt;
    
    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    private Set<Rating> ratings = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }
    
    // Method to calculate average rating
    @Transient
    public Double getAverageRating() {
        if (ratings.isEmpty())
            return 0.0;
        return ratings.stream()
                .mapToInt(Rating::getRating)
                .average()
                .orElse(0.0);
    }
}
