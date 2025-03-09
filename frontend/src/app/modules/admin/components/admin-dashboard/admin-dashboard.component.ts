import { Component, OnInit } from '@angular/core';
import { MovieService, Movie } from '../../../../services/movie.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  movies: Movie[] = [];
  totalMovies = 0;
  totalUsers = 0;
  totalRatings = 0;
  loading = false;
  error = '';

  constructor(
    private movieService: MovieService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';
    this.movieService.getAllMovies(0, 5)
      .subscribe({
        next: (response) => {
          this.movies = response.content;
          this.totalMovies = response.totalElements;
          this.loading = false;
          
          // Calculate total ratings
          this.totalRatings = this.movies.reduce((sum, movie) => {
            return sum + (movie.ratings ? movie.ratings.length : 0);
          }, 0);
          
          // For demo purposes, set a random number of users
          this.totalUsers = Math.floor(Math.random() * 50) + 10;
        },
        error: (err) => {
          console.error('Error loading dashboard data', err);
          this.error = 'Failed to load dashboard data. Please try again later.';
          this.loading = false;
        }
      });
  }

  removeMovie(id: number): void {
    if (confirm('Are you sure you want to remove this movie?')) {
      this.movieService.removeMovie(id)
        .subscribe({
          next: () => {
            this.movies = this.movies.filter(movie => movie.id !== id);
            this.totalMovies--;
            alert('Movie removed successfully');
          },
          error: (err) => {
            console.error('Error removing movie', err);
            alert('Failed to remove movie');
          }
        });
    }
  }
} 