import { Injectable } from '@angular/core';
import { Movie } from './movie.service';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly MOVIES_KEY = 'localMovies';

  constructor() { }

  // Get all movies from localStorage
  getLocalMovies(): Movie[] {
    try {
      const storedMoviesJson = localStorage.getItem(this.MOVIES_KEY);
      if (!storedMoviesJson) return [];
      
      const localMovies: Movie[] = JSON.parse(storedMoviesJson);
      console.log('Retrieved movies from localStorage:', localMovies.length);
      return localMovies;
    } catch (error) {
      console.error('Error getting movies from localStorage:', error);
      return [];
    }
  }

  // Save a movie to localStorage
  saveMovie(movie: Movie): void {
    try {
      console.log('Saving movie to localStorage:', movie.title);
      
      // Get existing movies
      const localMovies = this.getLocalMovies();
      
      // Check if movie already exists
      const existingIndex = localMovies.findIndex(m => m.imdbId === movie.imdbId);
      if (existingIndex !== -1) {
        // Update existing movie
        console.log('Updating existing movie in localStorage:', movie.title);
        localMovies[existingIndex] = movie;
      } else {
        // Add new movie
        console.log('Adding new movie to localStorage:', movie.title);
        localMovies.push(movie);
      }
      
      // Save back to localStorage
      localStorage.setItem(this.MOVIES_KEY, JSON.stringify(localMovies));
      console.log('Movie saved to localStorage successfully');
    } catch (error) {
      console.error('Error saving movie to localStorage:', error);
    }
  }

  // Remove a movie from localStorage by ID
  removeMovieById(id: number): void {
    try {
      const localMovies = this.getLocalMovies();
      const filteredMovies = localMovies.filter(movie => movie.id !== id);
      
      if (localMovies.length !== filteredMovies.length) {
        localStorage.setItem(this.MOVIES_KEY, JSON.stringify(filteredMovies));
        console.log('Movie removed from localStorage by ID:', id);
      }
    } catch (error) {
      console.error('Error removing movie from localStorage by ID:', error);
    }
  }

  // Remove a movie from localStorage by IMDB ID
  removeMovieByImdbId(imdbId: string): void {
    try {
      const localMovies = this.getLocalMovies();
      const filteredMovies = localMovies.filter(movie => movie.imdbId !== imdbId);
      
      if (localMovies.length !== filteredMovies.length) {
        localStorage.setItem(this.MOVIES_KEY, JSON.stringify(filteredMovies));
        console.log('Movie removed from localStorage by IMDB ID:', imdbId);
      }
    } catch (error) {
      console.error('Error removing movie from localStorage by IMDB ID:', error);
    }
  }

  // Get a movie from localStorage by ID
  getMovieById(id: number): Movie | null {
    try {
      const localMovies = this.getLocalMovies();
      return localMovies.find(movie => movie.id === id) || null;
    } catch (error) {
      console.error('Error getting movie from localStorage by ID:', error);
      return null;
    }
  }

  // Get a movie from localStorage by IMDB ID
  getMovieByImdbId(imdbId: string): Movie | null {
    try {
      const localMovies = this.getLocalMovies();
      return localMovies.find(movie => movie.imdbId === imdbId) || null;
    } catch (error) {
      console.error('Error getting movie from localStorage by IMDB ID:', error);
      return null;
    }
  }
} 