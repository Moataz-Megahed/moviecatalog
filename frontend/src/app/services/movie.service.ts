import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageService } from './local-storage.service';
import { AuthService } from './auth.service';

// Movie model interfaces
export interface Movie {
  id: number;
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: string;
  director: string;
  writer: string;
  actors: string;
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  imdbRating: string;
  imdbId: string;
  type: string;
  addedBy: User;
  ratings: Rating[];
  averageRating: number;
}

export interface User {
  id: number;
  username: string;
}

export interface Rating {
  id: number;
  value: number;
  comment?: string;
  user: User;
  movie: Movie;
  createdAt: string;
}

export interface OmdbResponse {
  Title: string;
  Year: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster: string;
  Ratings?: any[];
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID: string;
  Type: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
  Response: string;
  Error?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = 'http://localhost:8080/api/movies';
  private userApiUrl = 'http://localhost:8080/api/user/movies';
  private adminApiUrl = 'http://localhost:8080/api/admin';
  private publicApiUrl = 'http://localhost:8080/api/public';

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private authService: AuthService
  ) { }

  // Public movie endpoints
  getAllMovies(page: number = 0, size: number = 10, sortBy: string = 'id', direction: string = 'asc'): Observable<PageResponse<Movie>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);
    
    return this.http.get<PageResponse<Movie>>(this.apiUrl, { params })
      .pipe(
        map(response => this.mergeWithLocalMovies(response)),
        catchError(err => {
          console.error('Error getting movies from backend:', err);
          // If backend fails, return local movies as a PageResponse
          return of(this.getLocalMoviesAsPageResponse(page, size));
        })
      );
  }

  // Merge backend movies with local movies
  private mergeWithLocalMovies(response: PageResponse<Movie>): PageResponse<Movie> {
    try {
      // Get local movies
      const localMovies = this.localStorageService.getLocalMovies();
      if (localMovies.length === 0) {
        return response; // No local movies to merge
      }
      
      console.log('Merging local movies with backend movies');
      
      // Filter out local movies that already exist in the backend
      const uniqueLocalMovies = localMovies.filter(localMovie => 
        !response.content.some(backendMovie => backendMovie.imdbId === localMovie.imdbId)
      );
      
      if (uniqueLocalMovies.length === 0) {
        return response; // No unique local movies to add
      }
      
      console.log('Found unique local movies:', uniqueLocalMovies.length);
      
      // Create a new response with merged content
      const mergedResponse: PageResponse<Movie> = {
        ...response,
        content: [...response.content, ...uniqueLocalMovies],
        totalElements: response.totalElements + uniqueLocalMovies.length
      };
      
      return mergedResponse;
    } catch (error) {
      console.error('Error merging local movies:', error);
      return response;
    }
  }

  // Get local movies as a PageResponse
  private getLocalMoviesAsPageResponse(page: number, size: number): PageResponse<Movie> {
    const localMovies = this.localStorageService.getLocalMovies();
    const start = page * size;
    const end = start + size;
    const pagedMovies = localMovies.slice(start, end);
    
    return {
      content: pagedMovies,
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: {
          sorted: false,
          unsorted: true,
          empty: true
        },
        offset: page * size,
        paged: true,
        unpaged: false
      },
      last: end >= localMovies.length,
      totalElements: localMovies.length,
      totalPages: Math.ceil(localMovies.length / size),
      size: size,
      number: page,
      sort: {
        sorted: false,
        unsorted: true,
        empty: true
      },
      first: page === 0,
      numberOfElements: pagedMovies.length,
      empty: pagedMovies.length === 0
    };
  }

  searchMovies(title: string, page: number = 0, size: number = 10): Observable<PageResponse<Movie>> {
    let params = new HttpParams()
      .set('title', title)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PageResponse<Movie>>(`${this.apiUrl}/search`, { params })
      .pipe(
        map(response => this.mergeWithLocalMoviesForSearch(response, title)),
        catchError(err => {
          console.error('Error searching movies from backend:', err);
          // If backend fails, search local movies
          return of(this.searchLocalMovies(title, page, size));
        })
      );
  }

  // Merge backend search results with matching local movies
  private mergeWithLocalMoviesForSearch(response: PageResponse<Movie>, searchTerm: string): PageResponse<Movie> {
    try {
      // Get local movies
      const localMovies = this.localStorageService.getLocalMovies();
      if (localMovies.length === 0) {
        return response; // No local movies to merge
      }
      
      console.log('Searching local movies for:', searchTerm);
      
      // Filter local movies that match the search term
      const searchTermLower = searchTerm.toLowerCase();
      const matchingLocalMovies = localMovies.filter(movie => 
        movie.title.toLowerCase().includes(searchTermLower) &&
        !response.content.some(backendMovie => backendMovie.imdbId === movie.imdbId)
      );
      
      if (matchingLocalMovies.length === 0) {
        return response; // No matching local movies
      }
      
      console.log('Found matching local movies:', matchingLocalMovies.length);
      
      // Create a new response with merged content
      const mergedResponse: PageResponse<Movie> = {
        ...response,
        content: [...response.content, ...matchingLocalMovies],
        totalElements: response.totalElements + matchingLocalMovies.length
      };
      
      return mergedResponse;
    } catch (error) {
      console.error('Error merging local movies for search:', error);
      return response;
    }
  }

  // Search local movies
  private searchLocalMovies(searchTerm: string, page: number, size: number): PageResponse<Movie> {
    const localMovies = this.localStorageService.getLocalMovies();
    
    // Filter movies that match the search term
    const searchTermLower = searchTerm.toLowerCase();
    const matchingMovies = localMovies.filter(movie => 
      movie.title.toLowerCase().includes(searchTermLower)
    );
    
    // Paginate the results
    const start = page * size;
    const end = start + size;
    const pagedMovies = matchingMovies.slice(start, end);
    
    return {
      content: pagedMovies,
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: {
          sorted: false,
          unsorted: true,
          empty: true
        },
        offset: page * size,
        paged: true,
        unpaged: false
      },
      last: end >= matchingMovies.length,
      totalElements: matchingMovies.length,
      totalPages: Math.ceil(matchingMovies.length / size),
      size: size,
      number: page,
      sort: {
        sorted: false,
        unsorted: true,
        empty: true
      },
      first: page === 0,
      numberOfElements: pagedMovies.length,
      empty: pagedMovies.length === 0
    };
  }

  getMovieById(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(err => {
          console.error('Error getting movie from backend:', err);
          
          // Try to get the movie from localStorage
          const localMovie = this.localStorageService.getMovieById(id);
          if (localMovie) {
            console.log('Found movie in localStorage:', localMovie.title);
            return of(localMovie);
          }
          
          return throwError(() => new Error('Movie not found'));
        })
      );
  }

  rateMovie(movieId: number, rating: number, comment?: string): Observable<Rating> {
    const body = { rating, comment };
    
    // Check if user is authenticated with a valid token
    if (!this.authService.isLoggedIn() || !this.authService.getToken()) {
      console.log('User not logged in or token invalid, rating movie locally only');
      return this.rateMovieLocally(movieId, rating, comment);
    }
    
    // First try to rate the movie in the backend
    return this.http.post<Rating>(`${this.apiUrl}/${movieId}/rate`, body)
      .pipe(
        catchError(err => {
          console.error('Error rating movie in backend:', err);
          
          // If backend fails, try to rate the movie locally
          return this.rateMovieLocally(movieId, rating, comment);
        })
      );
  }
  
  // Rate a movie locally
  private rateMovieLocally(movieId: number, ratingValue: number, comment?: string): Observable<Rating> {
    console.log('Rating movie locally:', movieId, ratingValue, comment);
    
    // Get the movie from localStorage
    const movie = this.localStorageService.getMovieById(movieId);
    if (!movie) {
      return throwError(() => new Error('Movie not found'));
    }
    
    // Get current user or create a default one if not logged in
    const currentUser = this.authService.currentUserValue || {
      id: 999, // Default local user ID
      username: 'local_user',
      email: 'local@example.com',
      role: 'USER'
    };
    
    // Create a new rating
    const newRating: Rating = {
      id: Date.now(),
      value: ratingValue,
      comment: comment || '',
      user: {
        id: currentUser.id,
        username: currentUser.username
      },
      movie: movie,
      createdAt: new Date().toISOString()
    };
    
    // Add the rating to the movie
    if (!movie.ratings) {
      movie.ratings = [];
    }
    
    // Check if the user has already rated this movie
    const existingRatingIndex = movie.ratings.findIndex(r => r.user.id === newRating.user.id);
    if (existingRatingIndex >= 0) {
      // Update existing rating
      movie.ratings[existingRatingIndex] = newRating;
    } else {
      // Add new rating
      movie.ratings.push(newRating);
    }
    
    // Recalculate average rating
    movie.averageRating = movie.ratings.reduce((sum, r) => sum + r.value, 0) / movie.ratings.length;
    
    // Save the updated movie to localStorage
    this.localStorageService.saveMovie(movie);
    
    // Return the new rating
    return of(newRating);
  }
  
  // Get user rating for a movie
  getUserRatingForMovie(movieId: number): Observable<Rating> {
    // If user is not logged in or token is invalid, check only local storage
    if (!this.authService.isLoggedIn() || !this.authService.getToken()) {
      console.log('User not logged in or token invalid, checking only local storage for rating');
      return this.getUserRatingLocally(movieId);
    }
    
    return this.http.get<Rating>(`${this.userApiUrl}/${movieId}/rating`)
      .pipe(
        catchError(err => {
          console.error('Error getting user rating from backend:', err);
          // If backend fails, try to get the rating from localStorage
          return this.getUserRatingLocally(movieId);
        })
      );
  }
  
  // Get user rating for a movie from localStorage
  private getUserRatingLocally(movieId: number): Observable<Rating> {
    console.log('Getting user rating locally for movie:', movieId);
    
    // Get current user or use a default one
    const currentUser = this.authService.currentUserValue || {
      id: 999, // Default local user ID
      username: 'local_user'
    };
    
    // Get the movie from localStorage
    const movie = this.localStorageService.getMovieById(movieId);
    if (!movie || !movie.ratings) {
      return throwError(() => new Error('No rating found'));
    }
    
    // Find the rating by the current user
    const userRating = movie.ratings.find(rating => 
      rating.user.id === currentUser.id || 
      (currentUser.id === 999 && rating.user.id === 999) // Match local user ratings
    );
    
    if (!userRating) {
      return throwError(() => new Error('No rating found'));
    }
    
    return of(userRating);
  }

  // User-specific movie endpoints
  getUserMovies(page: number = 0, size: number = 10): Observable<PageResponse<Movie>> {
    // If user is not logged in or token is invalid, return only local rated movies
    if (!this.authService.isLoggedIn() || !this.authService.getToken()) {
      console.log('User not logged in or token invalid, returning only local rated movies');
      return of(this.getLocalRatedMoviesAsPageResponse(page, size));
    }
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PageResponse<Movie>>(this.userApiUrl, { params })
      .pipe(
        map(response => this.mergeWithLocalRatedMovies(response)),
        catchError(err => {
          console.error('Error fetching user movies from backend:', err);
          // If backend fails, return only local rated movies
          return of(this.getLocalRatedMoviesAsPageResponse(page, size));
        })
      );
  }
  
  // Merge backend user movies with locally rated movies
  private mergeWithLocalRatedMovies(response: PageResponse<Movie>): PageResponse<Movie> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return response;
    }
    
    // Get all local movies
    const localMovies = this.localStorageService.getLocalMovies();
    
    // Filter to only include movies rated by the current user
    const localRatedMovies = localMovies.filter(movie => 
      movie.ratings && movie.ratings.some(rating => rating.user.id === currentUser.id)
    );
    
    // Get IDs of movies already in the response to avoid duplicates
    const existingIds = new Set(response.content.map(movie => movie.id));
    
    // Add local rated movies that aren't already in the response
    const newLocalMovies = localRatedMovies.filter(movie => !existingIds.has(movie.id));
    
    // Create a new response with merged content
    const mergedResponse: PageResponse<Movie> = {
      ...response,
      content: [...response.content, ...newLocalMovies],
      totalElements: response.totalElements + newLocalMovies.length,
      totalPages: Math.ceil((response.totalElements + newLocalMovies.length) / response.size),
      numberOfElements: response.numberOfElements + newLocalMovies.length
    };
    
    return mergedResponse;
  }
  
  // Get locally rated movies as a PageResponse
  private getLocalRatedMoviesAsPageResponse(page: number, size: number): PageResponse<Movie> {
    // Get current user or use a default one
    const currentUser = this.authService.currentUserValue || {
      id: 999, // Default local user ID
      username: 'local_user'
    };
    
    // Get all local movies
    const localMovies = this.localStorageService.getLocalMovies();
    
    // Filter to only include movies rated by the current user
    const localRatedMovies = localMovies.filter(movie => 
      movie.ratings && movie.ratings.some(rating => 
        rating.user.id === currentUser.id || 
        (currentUser.id === 999 && rating.user.id === 999) // Match local user ratings
      )
    );
    
    console.log('Found local rated movies:', localRatedMovies.length);
    
    // Calculate pagination
    const totalElements = localRatedMovies.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = page * size;
    const endIndex = Math.min(startIndex + size, totalElements);
    const pagedMovies = localRatedMovies.slice(startIndex, endIndex);
    
    return {
      content: pagedMovies,
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: { sorted: false, unsorted: true, empty: true },
        offset: page * size,
        paged: true,
        unpaged: false
      },
      last: page >= totalPages - 1,
      totalElements: totalElements,
      totalPages: totalPages,
      size: size,
      number: page,
      sort: { sorted: false, unsorted: true, empty: true },
      first: page === 0,
      numberOfElements: pagedMovies.length,
      empty: pagedMovies.length === 0
    };
  }
  
  // Helper method to create an empty PageResponse
  private getEmptyPageResponse(): PageResponse<Movie> {
    return {
      content: [],
      pageable: {
        pageNumber: 0,
        pageSize: 10,
        sort: { sorted: false, unsorted: true, empty: true },
        offset: 0,
        paged: true,
        unpaged: false
      },
      last: true,
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      sort: { sorted: false, unsorted: true, empty: true },
      first: true,
      numberOfElements: 0,
      empty: true
    };
  }

  // Admin movie endpoints
  searchOmdb(title: string, page: number = 1): Observable<OmdbResponse[]> {
    // Encode the search term to handle spaces and special characters
    const encodedTitle = encodeURIComponent(title.trim());
    
    let params = new HttpParams()
      .set('title', encodedTitle)
      .set('page', page.toString());
    
    console.log('Sending OMDB search request to backend:', `${this.publicApiUrl}/omdb/search`, { params });
    
    return this.http.get<OmdbResponse[]>(`${this.publicApiUrl}/omdb/search`, { params })
      .pipe(
        catchError((error) => {
          console.error('Error in searchOmdb:', error);
          return throwError(() => error);
        })
      );
  }

  getOmdbDetails(imdbId: string): Observable<OmdbResponse> {
    return this.http.get<OmdbResponse>(`${this.publicApiUrl}/omdb/details/${imdbId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  addMovie(imdbId: string): Observable<Movie> {
    return this.http.post<Movie>(`${this.adminApiUrl}/movies`, { imdbId })
      .pipe(
        catchError(this.handleError)
      );
  }

  addMoviesBatch(imdbIds: string[]): Observable<Movie[]> {
    return this.http.post<Movie[]>(`${this.adminApiUrl}/movies/batch`, imdbIds)
      .pipe(
        catchError(this.handleError)
      );
  }

  removeMovie(id: number): Observable<any> {
    return this.http.delete(`${this.adminApiUrl}/movies/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  removeMoviesBatch(ids: number[]): Observable<any> {
    return this.http.delete(`${this.adminApiUrl}/movies/batch`, { body: ids })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Direct HTTP search for OMDB movies
  searchOmdbDirect(title: string, page: number = 1): Observable<OmdbResponse[]> {
    // Encode the search term to handle spaces and special characters
    const encodedTitle = encodeURIComponent(title.trim());
    
    let params = new HttpParams()
      .set('title', encodedTitle)
      .set('page', page.toString());
    
    console.log('Sending direct OMDB search request to backend:', `${this.publicApiUrl}/omdb/direct-search`, { params });
    
    return this.http.get<OmdbResponse[]>(`${this.publicApiUrl}/omdb/direct-search`, { params })
      .pipe(
        catchError((error) => {
          console.error('Error in direct searchOmdb:', error);
          return throwError(() => error);
        })
      );
  }

  // Simple search for OMDB movies
  searchOmdbSimple(title: string, page: number = 1): Observable<OmdbResponse[]> {
    // Encode the search term to handle spaces and special characters
    const encodedTitle = encodeURIComponent(title.trim());
    
    let params = new HttpParams()
      .set('title', encodedTitle)
      .set('page', page.toString());
    
    console.log('Sending simple OMDB search request to backend:', `${this.publicApiUrl}/omdb/simple-search`, { params });
    
    return this.http.get<OmdbResponse[]>(`${this.publicApiUrl}/omdb/simple-search`, { params })
      .pipe(
        catchError((error) => {
          console.error('Error in simple searchOmdb:', error);
          return throwError(() => error);
        })
      );
  }
  
  // Get OMDB movie details by title
  getOmdbDetailsByTitle(title: string): Observable<OmdbResponse> {
    // Encode the title to handle spaces and special characters
    const encodedTitle = encodeURIComponent(title.trim());
    
    console.log('Getting OMDB details by title:', title);
    
    return this.http.get<OmdbResponse>(`${this.publicApiUrl}/omdb/title/${encodedTitle}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
} 