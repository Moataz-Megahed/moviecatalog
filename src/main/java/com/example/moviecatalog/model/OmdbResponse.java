package com.example.moviecatalog.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class OmdbResponse {
    
    @JsonProperty("imdbID")
    private String imdbId;
    
    @JsonProperty("Title")
    private String title;
    
    @JsonProperty("Year")
    private String year;
    
    @JsonProperty("Poster")
    private String posterUrl;
    
    @JsonProperty("Plot")
    private String plot;
    
    @JsonProperty("Director")
    private String director;
    
    @JsonProperty("Actors")
    private String actors;
    
    @JsonProperty("Genre")
    private String genre;
    
    @JsonProperty("Runtime")
    private String runtime;
    
    @JsonProperty("Rated")
    private String rated;
    
    @JsonProperty("Released")
    private String released;
    
    @JsonProperty("Writer")
    private String writer;
    
    @JsonProperty("Language")
    private String language;
    
    @JsonProperty("Country")
    private String country;
    
    @JsonProperty("Awards")
    private String awards;
    
    @JsonProperty("imdbRating")
    private String imdbRating;
    
    @JsonProperty("Type")
    private String type;
    
    @JsonProperty("Response")
    private String response;
    
    @JsonProperty("Error")
    private String error;
    
    // Convert to Movie entity
    public Movie toMovie() {
        Movie movie = new Movie();
        movie.setImdbId(this.imdbId);
        movie.setTitle(this.title);
        movie.setYear(this.year);
        movie.setPosterUrl(this.posterUrl);
        movie.setPlot(this.plot);
        movie.setDirector(this.director);
        movie.setActors(this.actors);
        movie.setGenre(this.genre);
        movie.setRuntime(this.runtime);
        movie.setRated(this.rated);
        movie.setReleased(this.released);
        movie.setWriter(this.writer);
        movie.setLanguage(this.language);
        movie.setCountry(this.country);
        movie.setAwards(this.awards);
        movie.setImdbRating(this.imdbRating);
        movie.setType(this.type);
        return movie;
    }
}
