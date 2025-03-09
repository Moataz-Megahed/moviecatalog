import { Component, OnInit } from '@angular/core';
import { MovieService, Movie, PageResponse, Rating } from '../../../../services/movie.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-user-movies',
  templateUrl: './user-movies.component.html',
  styleUrls: ['./user-movies.component.css']
})
export class UserMoviesComponent implements OnInit {
  movies: Movie[] = [];
  totalItems = 0;
  currentPage = 0;
  pageSize = 12;
  loading = false;
  error = '';
  Math = Math; // For use in template
  isLocalOnly = false;

  constructor(
    private movieService: MovieService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Check if we're using local storage only
    this.isLocalOnly = !this.authService.isLoggedIn() || !this.authService.getToken();
    this.loadUserMovies();
  }

  loadUserMovies(): void {
    this.loading = true;
    this.error = '';
    
    this.movieService.getUserMovies(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PageResponse<Movie>) => {
          this.movies = response.content;
          this.totalItems = response.totalElements;
          this.loading = false;
          
          if (this.movies.length === 0) {
            this.error = 'You haven\'t rated any movies yet. Browse the movie catalog to find and rate movies.';
          }
        },
        error: (error: Error) => {
          console.error('Error loading user movies', error);
          this.error = 'Failed to load your movies. Please try again later.';
          this.loading = false;
        }
      });
  }

  getUserRatingForMovie(movie: Movie): number {
    if (!movie.ratings || movie.ratings.length === 0) {
      return 0;
    }
    
    const currentUser = this.authService.currentUserValue;
    const userId = currentUser ? currentUser.id : 999; // Use 999 for local user
    
    const userRating = movie.ratings.find(rating => 
      rating.user.id === userId || 
      (userId === 999 && rating.user.id === 999)
    );
    
    return userRating ? userRating.value : 0;
  }

  onPageChange(page: number): void {
    if (page < 0 || page >= Math.ceil(this.totalItems / this.pageSize)) {
      return;
    }
    
    this.currentPage = page;
    this.loadUserMovies();
  }
} 