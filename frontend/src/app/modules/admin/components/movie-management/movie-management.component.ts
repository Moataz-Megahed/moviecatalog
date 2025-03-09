import { Component, OnInit } from '@angular/core';
import { MovieService, Movie, OmdbResponse, PageResponse } from '../../../../services/movie.service';
import { LocalStorageService } from '../../../../services/local-storage.service';

@Component({
  selector: 'app-movie-management',
  templateUrl: './movie-management.component.html',
  styleUrls: ['./movie-management.component.css']
})
export class MovieManagementComponent implements OnInit {
  // OMDB search
  searchTerm = '';
  searchResults: OmdbResponse[] = [];
  searchLoading = false;
  searchPage = 1;
  searchError = '';
  
  // Database movies
  movies: Movie[] = [];
  totalMovies = 0;
  currentPage = 0;
  pageSize = 10;
  loading = false;
  error = '';
  
  // Selected movie details
  selectedMovie: OmdbResponse | null = null;
  detailsLoading = false;
  detailsError = '';
  
  // For pagination
  Math = Math;

  constructor(
    private movieService: MovieService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    console.log('MovieManagementComponent initialized');
    // Load movies from both backend and localStorage
    this.loadMovies();
  }

  loadMovies(): void {
    console.log('Loading movies...');
    this.loading = true;
    this.error = '';
    
    // First try to load movies from the backend
    this.movieService.getAllMovies(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PageResponse<Movie>) => {
          console.log('Movies loaded from backend:', response.content.length);
          this.movies = response.content;
          this.totalMovies = response.totalElements;
          
          // After loading from backend, also load from localStorage and merge
          this.mergeLocalMovies();
          
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading movies from backend', err);
          this.error = 'Failed to load movies from server. Loading local movies instead.';
          
          // If backend fails, load movies from localStorage only
          this.loadLocalMovies();
          
          this.loading = false;
        }
      });
  }
  
  // Load movies from localStorage
  loadLocalMovies(): void {
    const localMovies = this.localStorageService.getLocalMovies();
    console.log('Loaded movies from localStorage:', localMovies.length);
    
    if (localMovies.length > 0) {
      this.movies = localMovies;
      this.totalMovies = localMovies.length;
      console.log('Movies loaded from localStorage successfully');
    } else {
      console.log('No movies found in localStorage');
      this.movies = [];
      this.totalMovies = 0;
    }
  }
  
  // Merge local movies with backend movies
  mergeLocalMovies(): void {
    const localMovies = this.localStorageService.getLocalMovies();
    console.log('Found local movies in localStorage:', localMovies.length);
    
    if (localMovies.length === 0) return;
    
    // Filter out local movies that already exist in the backend list
    const newLocalMovies = localMovies.filter(localMovie => 
      !this.movies.some(backendMovie => backendMovie.imdbId === localMovie.imdbId)
    );
    
    console.log('New local movies not in backend:', newLocalMovies.length);
    
    if (newLocalMovies.length > 0) {
      // Add local-only movies to the list
      this.movies = [...this.movies, ...newLocalMovies];
      this.totalMovies += newLocalMovies.length;
      console.log('Updated movies list with local movies, total:', this.movies.length);
    }
  }

  searchOmdb(): void {
    // Use the direct OMDB API call instead of going through the backend
    this.directOmdbApiCall();
  }

  loadMoreResults(): void {
    this.searchPage++;
    this.searchLoading = true;
    
    // OMDB API key
    const apiKey = 'd471685f';
    
    // Encode the search term
    const encodedSearchTerm = encodeURIComponent(this.searchTerm.trim());
    
    // Construct the URL for search with page parameter
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodedSearchTerm}&type=movie&page=${this.searchPage}`;
    console.log('Direct OMDB API URL for more results:', url);
    
    // Make the request
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log('Direct OMDB API response for more results:', data);
        
        if (data.Response === 'True' && data.Search && data.Search.length > 0) {
          // Convert the OMDB API response to our OmdbResponse format
          const newResults = data.Search.map((movie: any) => ({
            Title: movie.Title,
            Year: movie.Year,
            imdbID: movie.imdbID,
            Type: movie.Type,
            Poster: movie.Poster,
            Response: 'True'
          }));
          
          // Add new results to existing results
          this.searchResults = [...this.searchResults, ...newResults];
        } else {
          // No more results
          this.searchPage--;
        }
        
        this.searchLoading = false;
      })
      .catch(error => {
        console.error('Error loading more results:', error);
        this.searchError = `Error loading more results: ${error.message}`;
        this.searchLoading = false;
        this.searchPage--; // Revert page increment
      });
  }

  viewMovieDetails(imdbId: string): void {
    console.log('Viewing movie details for IMDB ID:', imdbId);
    this.detailsLoading = true;
    this.detailsError = '';
    
    // First, check if we have the movie in the database
    const databaseMovie = this.movies.find(movie => movie.imdbId === imdbId);
    if (databaseMovie) {
      console.log('Found movie in database:', databaseMovie.title);
      this.viewDatabaseMovieDetails(databaseMovie);
      return;
    }
    
    // Next, check if we have the movie in localStorage
    const localMovie = this.getMovieByImdbIdFromLocalStorage(imdbId);
    if (localMovie) {
      console.log('Found movie in localStorage:', localMovie.title);
      
      // Convert the local Movie to OmdbResponse format
      this.selectedMovie = {
        Title: localMovie.title,
        Year: localMovie.year,
        Rated: localMovie.rated,
        Released: localMovie.released,
        Runtime: localMovie.runtime,
        Genre: localMovie.genre,
        Director: localMovie.director,
        Writer: localMovie.writer,
        Actors: localMovie.actors,
        Plot: localMovie.plot,
        Language: localMovie.language,
        Country: localMovie.country,
        Awards: localMovie.awards,
        Poster: localMovie.poster,
        imdbRating: localMovie.imdbRating,
        imdbID: localMovie.imdbId,
        Type: localMovie.type,
        Response: 'True'
      };
      
      this.detailsLoading = false;
      return;
    }
    
    // If not found locally, try to get from OMDB API
    // OMDB API key
    const apiKey = 'd471685f';
    
    // Construct the URL for movie details
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}&plot=full`;
    console.log('Direct OMDB API URL for movie details:', url);
    
    // Make the request
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Direct OMDB API response for movie details:', data);
        
        if (data.Response === 'True') {
          // Convert the OMDB API response to our OmdbResponse format
          this.selectedMovie = {
            Title: data.Title,
            Year: data.Year,
            Rated: data.Rated,
            Released: data.Released,
            Runtime: data.Runtime,
            Genre: data.Genre,
            Director: data.Director,
            Writer: data.Writer,
            Actors: data.Actors,
            Plot: data.Plot,
            Language: data.Language,
            Country: data.Country,
            Awards: data.Awards,
            Poster: data.Poster,
            Ratings: data.Ratings,
            Metascore: data.Metascore,
            imdbRating: data.imdbRating,
            imdbVotes: data.imdbVotes,
            imdbID: data.imdbID,
            Type: data.Type,
            DVD: data.DVD,
            BoxOffice: data.BoxOffice,
            Production: data.Production,
            Website: data.Website,
            Response: data.Response
          };
          
          // Save this movie to localStorage for future reference
          this.saveMovieToLocalStorage({
            id: Date.now(),
            title: data.Title,
            year: data.Year,
            rated: data.Rated || 'N/A',
            released: data.Released || 'N/A',
            runtime: data.Runtime || 'N/A',
            genre: data.Genre || 'N/A',
            director: data.Director || 'N/A',
            writer: data.Writer || 'N/A',
            actors: data.Actors || 'N/A',
            plot: data.Plot || 'N/A',
            language: data.Language || 'N/A',
            country: data.Country || 'N/A',
            awards: data.Awards || 'N/A',
            poster: data.Poster || 'N/A',
            imdbRating: data.imdbRating || 'N/A',
            imdbId: data.imdbID,
            type: data.Type || 'movie',
            addedBy: {
              id: 1,
              username: 'admin'
            },
            ratings: [],
            averageRating: 0
          });
        } else {
          this.detailsError = data.Error || 'Failed to load movie details';
        }
        
        this.detailsLoading = false;
      })
      .catch(error => {
        console.error('Error loading movie details:', error);
        this.detailsError = `Error loading movie details: ${error.message}`;
        this.detailsLoading = false;
      });
  }

  // Direct method to add a movie to the local list and database
  directAddMovie(imdbId: string): void {
    if (!imdbId) {
      alert('Invalid IMDB ID');
      return;
    }
    
    console.log('Adding movie with IMDB ID:', imdbId);
    this.loading = true;
    this.error = '';
    
    // First, check if the movie already exists in our list
    const existingMovie = this.movies.find(movie => movie.imdbId === imdbId);
    if (existingMovie) {
      console.log('Movie already exists in the list:', existingMovie.title);
      this.loading = false;
      alert(`Movie "${existingMovie.title}" is already in the database!`);
      this.closeDetails();
      return;
    }
    
    // Get movie details from OMDB API first to ensure we have the data
    const apiKey = 'd471685f';
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbId}&plot=full`;
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.Response !== 'True') {
          throw new Error(data.Error || 'Failed to get movie details');
        }
        
        console.log('Got movie details from OMDB:', data.Title);
        
        // Create a local movie object
        const localMovie: Movie = {
          id: Date.now(),
          title: data.Title,
          year: data.Year,
          rated: data.Rated || 'N/A',
          released: data.Released || 'N/A',
          runtime: data.Runtime || 'N/A',
          genre: data.Genre || 'N/A',
          director: data.Director || 'N/A',
          writer: data.Writer || 'N/A',
          actors: data.Actors || 'N/A',
          plot: data.Plot || 'N/A',
          language: data.Language || 'N/A',
          country: data.Country || 'N/A',
          awards: data.Awards || 'N/A',
          poster: data.Poster || 'N/A',
          imdbRating: data.imdbRating || 'N/A',
          imdbId: data.imdbID,
          type: data.Type || 'movie',
          addedBy: {
            id: 1,
            username: 'admin'
          },
          ratings: [], // Initialize empty ratings array
          averageRating: 0
        };
        
        // Add to localStorage immediately
        this.saveMovieToLocalStorage(localMovie);
        
        // Add to local list immediately
        this.movies.unshift(localMovie);
        this.totalMovies++;
        
        // Now try to add to backend
        this.movieService.addMovie(imdbId)
          .subscribe({
            next: (backendMovie) => {
              console.log('Movie added to backend successfully:', backendMovie);
              
              // Update the local movie with backend data
              const index = this.movies.findIndex(m => m.imdbId === backendMovie.imdbId);
              if (index !== -1) {
                this.movies[index] = backendMovie;
                
                // Also update in localStorage
                this.saveMovieToLocalStorage(backendMovie);
              }
              
              this.loading = false;
            },
            error: (err) => {
              console.error('Error adding movie to backend:', err);
              // Movie is already added locally, so just finish loading
              this.loading = false;
            }
          });
        
        // Close details and show success message
        this.closeDetails();
        alert(`Movie "${localMovie.title}" added successfully!`);
      })
      .catch(error => {
        console.error('Error adding movie:', error);
        this.error = `Error adding movie: ${error.message}`;
        this.loading = false;
      });
  }

  removeMovie(id: number): void {
    if (confirm('Are you sure you want to remove this movie?')) {
      this.loading = true;
      this.error = '';
      
      // Find the movie in our local list
      const movieToRemove = this.movies.find(movie => movie.id === id);
      if (!movieToRemove) {
        this.error = 'Movie not found';
        this.loading = false;
        return;
      }
      
      // Try to remove from backend first
      this.movieService.removeMovie(id)
        .subscribe({
          next: () => {
            console.log('Movie removed from backend successfully');
            this.removeMovieFromLocalList(id);
            this.removeMovieFromLocalStorage(movieToRemove.imdbId);
            this.loading = false;
            alert('Movie removed successfully!');
          },
          error: (err) => {
            console.error('Error removing movie from backend', err);
            
            // If backend fails, just remove from local list and localStorage
            this.removeMovieFromLocalList(id);
            this.removeMovieFromLocalStorage(movieToRemove.imdbId);
            this.loading = false;
            alert('Movie removed from local storage!');
          }
        });
    }
  }
  
  // Remove movie from local list
  removeMovieFromLocalList(id: number): void {
    this.movies = this.movies.filter(movie => movie.id !== id);
    this.totalMovies--;
  }
  
  // Remove movie from localStorage
  removeMovieFromLocalStorage(imdbId: string): void {
    this.localStorageService.removeMovieByImdbId(imdbId);
  }

  onPageChange(page: number): void {
    if (page < 0 || page >= Math.ceil(this.totalMovies / this.pageSize)) {
      return;
    }
    
    this.currentPage = page;
    this.loadMovies();
  }

  closeDetails(): void {
    this.selectedMovie = null;
    this.detailsError = '';
  }

  // Direct OMDB API call (bypassing backend)
  directOmdbApiCall(): void {
    if (!this.searchTerm.trim()) {
      this.searchError = 'Please enter a search term';
      return;
    }
    
    console.log('Directly searching OMDB API for:', this.searchTerm);
    this.searchLoading = true;
    this.searchError = '';
    this.searchResults = [];
    
    // OMDB API key
    const apiKey = 'd471685f';
    
    // Encode the search term
    const encodedSearchTerm = encodeURIComponent(this.searchTerm.trim());
    
    // Construct the URL for search
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodedSearchTerm}&type=movie`;
    console.log('Direct OMDB API URL:', url);
    
    // Make the request
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log('Direct OMDB API response:', data);
        
        if (data.Response === 'True' && data.Search && data.Search.length > 0) {
          // Convert the OMDB API response to our OmdbResponse format
          this.searchResults = data.Search.map((movie: any) => ({
            Title: movie.Title,
            Year: movie.Year,
            imdbID: movie.imdbID,
            Type: movie.Type,
            Poster: movie.Poster,
            Response: 'True'
          }));
          
          // If searching for a sequel, try to find an exact match
          if (this.searchTerm.includes('Vol.') || this.searchTerm.includes('Part')) {
            const exactMatch = this.searchResults.find(movie => 
              movie.Title.toLowerCase().includes(this.searchTerm.toLowerCase()));
            
            if (exactMatch) {
              console.log('Found exact match:', exactMatch);
              // Move the exact match to the top
              this.searchResults = [
                exactMatch,
                ...this.searchResults.filter(movie => movie.imdbID !== exactMatch.imdbID)
              ];
            }
          }
        } else {
          this.searchError = data.Error || `No results found for "${this.searchTerm}"`;
          
          // If no results found with search, try getting by exact title
          if (this.searchTerm.includes('Vol.') || this.searchTerm.includes('Part')) {
            this.directGetMovieByTitle();
          }
        }
        
        this.searchLoading = false;
      })
      .catch(error => {
        console.error('Error directly searching OMDB:', error);
        this.searchError = `Error searching OMDB: ${error.message}`;
        this.searchLoading = false;
      });
  }
  
  // Direct OMDB API call to get movie by title
  directGetMovieByTitle(): void {
    console.log('Directly getting movie by title from OMDB API:', this.searchTerm);
    
    // OMDB API key
    const apiKey = 'd471685f';
    
    // Encode the title
    const encodedTitle = encodeURIComponent(this.searchTerm.trim());
    
    // Construct the URL for title search
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&t=${encodedTitle}`;
    console.log('Direct OMDB API title URL:', url);
    
    // Make the request
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log('Direct OMDB API title response:', data);
        
        if (data.Response === 'True') {
          // Add the movie to the results
          this.searchResults = [{
            Title: data.Title,
            Year: data.Year,
            imdbID: data.imdbID,
            Type: data.Type,
            Poster: data.Poster,
            Response: 'True',
            // Additional fields from the detailed response
            Plot: data.Plot,
            Director: data.Director,
            Actors: data.Actors,
            imdbRating: data.imdbRating
          }];
        } else {
          this.searchError = data.Error || `No results found for "${this.searchTerm}"`;
        }
        
        this.searchLoading = false;
      })
      .catch(error => {
        console.error('Error directly getting movie by title from OMDB:', error);
        this.searchError = `Error getting movie details: ${error.message}`;
        this.searchLoading = false;
      });
  }

  // View details of a movie from the database
  viewDatabaseMovieDetails(movie: Movie): void {
    console.log('Viewing database movie details:', movie);
    this.detailsLoading = true;
    this.detailsError = '';
    
    // Convert the Movie object to OmdbResponse format
    this.selectedMovie = {
      Title: movie.title,
      Year: movie.year,
      Rated: movie.rated,
      Released: movie.released,
      Runtime: movie.runtime,
      Genre: movie.genre,
      Director: movie.director,
      Writer: movie.writer,
      Actors: movie.actors,
      Plot: movie.plot,
      Language: movie.language,
      Country: movie.country,
      Awards: movie.awards,
      Poster: movie.poster,
      imdbRating: movie.imdbRating,
      imdbID: movie.imdbId,
      Type: movie.type,
      Response: 'True'
    };
    
    this.detailsLoading = false;
  }

  // Save movie to localStorage for persistence
  saveMovieToLocalStorage(movie: Movie): void {
    this.localStorageService.saveMovie(movie);
  }
  
  // Get movie from localStorage by ID
  getMovieFromLocalStorage(id: number): Movie | null {
    return this.localStorageService.getMovieById(id);
  }
  
  // Get movie from localStorage by IMDB ID
  getMovieByImdbIdFromLocalStorage(imdbId: string): Movie | null {
    return this.localStorageService.getMovieByImdbId(imdbId);
  }

  // Original addMovie method (now calls directAddMovie)
  addMovie(imdbId: string): void {
    this.directAddMovie(imdbId);
  }
} 