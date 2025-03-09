import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { AuthService } from '../../services/auth.service';
import { Movie, Rating } from '../../models/movie.model';

@Component({
  selector: 'app-movie-detail',
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css']
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  loading = true;
  error = false;
  userRating = 0;
  comment = '';
  isLoggedIn = false;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadMovie(+id);
        if (this.isLoggedIn) {
          this.loadUserRating(+id);
        }
      }
    });
  }

  loadMovie(id: number): void {
    this.loading = true;
    this.movieService.getMovieById(id).subscribe(
      movie => {
        this.movie = movie;
        this.loading = false;
      },
      error => {
        console.error('Error loading movie', error);
        this.loading = false;
        this.error = true;
      }
    );
  }

  loadUserRating(movieId: number): void {
    this.movieService.getUserRatingForMovie(movieId).subscribe(
      rating => {
        if (rating) {
          this.userRating = rating.value;
          this.comment = rating.comment || '';
        }
      },
      error => {
        console.error('Error loading user rating', error);
      }
    );
  }

  rateMovie(): void {
    if (!this.movie || !this.userRating) return;
    
    this.movieService.rateMovie(this.movie.id, this.userRating, this.comment).subscribe(
      rating => {
        // Update the movie's ratings
        if (this.movie) {
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
      },
      error => {
        console.error('Error rating movie', error);
      }
    );
  }

  removeMovie(): void {
    if (!this.movie) return;
    
    if (confirm(`Are you sure you want to remove "${this.movie.title}" from the catalog?`)) {
      this.movieService.removeMovie(this.movie.id).subscribe(
        () => {
          alert('Movie removed successfully');
          window.history.back();
        },
        error => {
          console.error('Error removing movie', error);
          alert('Failed to remove movie');
        }
      );
    }
  }
} 