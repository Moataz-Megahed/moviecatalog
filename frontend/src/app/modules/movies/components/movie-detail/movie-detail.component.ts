import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService, Movie, Rating } from '../../../../services/movie.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  loading = true;
  error = '';
  userRating = 0;
  comment = '';
  isLoggedIn = false;
  isAdmin = false;
  ratingSubmitted = false;
  ratingSuccess = false;
  ratingError = '';
  
  // Add Math property to use in template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadMovie(id);
      } else {
        this.error = 'Invalid movie ID';
        this.loading = false;
      }
    });
  }

  loadMovie(id: number): void {
    this.loading = true;
    this.error = '';
    
    this.movieService.getMovieById(id).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.loading = false;
        
        // If user is logged in, load their rating
        if (this.isLoggedIn && this.movie) {
          this.loadUserRating(this.movie.id);
        }
      },
      error: (err) => {
        console.error('Error loading movie', err);
        this.error = 'Failed to load movie details. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadUserRating(movieId: number): void {
    this.movieService.getUserRatingForMovie(movieId).subscribe({
      next: (rating) => {
        this.userRating = rating.value;
        this.comment = rating.comment || '';
        console.log('Loaded user rating:', this.userRating);
      },
      error: (err) => {
        console.log('No existing rating found:', err.message);
        // Don't show error to user, just log it
      }
    });
  }

  rateMovie(): void {
    if (!this.movie || !this.userRating) {
      this.ratingError = 'Please select a rating';
      return;
    }
    
    console.log('Submitting rating:', this.userRating, this.comment);
    this.ratingSubmitted = true;
    this.ratingSuccess = false;
    this.ratingError = '';
    
    this.movieService.rateMovie(this.movie.id, this.userRating, this.comment).subscribe({
      next: (rating) => {
        console.log('Rating submitted successfully:', rating);
        
        // Update the movie's ratings
        if (this.movie) {
          if (!this.movie.ratings) {
            this.movie.ratings = [];
          }
          
          const existingRatingIndex = this.movie.ratings.findIndex(r => 
            r.user.id === rating.user.id);
          
          if (existingRatingIndex >= 0) {
            this.movie.ratings[existingRatingIndex] = rating;
          } else {
            this.movie.ratings.push(rating);
          }
          
          // Recalculate average rating
          this.movie.averageRating = this.movie.ratings.reduce((sum, r) => sum + r.value, 0) / this.movie.ratings.length;
        }
        
        this.ratingSuccess = true;
        this.ratingSubmitted = false;
      },
      error: (err) => {
        console.error('Error rating movie', err);
        this.ratingError = 'Failed to submit rating. Please try again.';
        this.ratingSubmitted = false;
      }
    });
  }

  removeMovie(): void {
    if (!this.movie) return;
    
    if (confirm(`Are you sure you want to remove "${this.movie.title}" from the catalog?`)) {
      this.movieService.removeMovie(this.movie.id).subscribe({
        next: () => {
          alert('Movie removed successfully');
          this.router.navigate(['/movies']);
        },
        error: (err) => {
          console.error('Error removing movie', err);
          alert('Failed to remove movie');
        }
      });
    }
  }
} 