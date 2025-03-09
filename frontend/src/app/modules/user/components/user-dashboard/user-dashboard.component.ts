import { Component, OnInit } from '@angular/core';
import { MovieService, Movie, PageResponse } from '../../../../services/movie.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  movies: Movie[] = [];
  totalMovies = 0;
  currentPage = 0;
  pageSize = 12;
  loading = false;
  error = '';
  searchTerm = '';
  Math = Math;

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loading = true;
    this.error = '';
    this.movieService.getAllMovies(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PageResponse<Movie>) => {
          this.movies = response.content;
          this.totalMovies = response.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading movies', err);
          this.error = err.error?.error || 'Failed to load movies. Please try again later.';
          this.loading = false;
        }
      });
  }

  searchMovies(): void {
    if (!this.searchTerm.trim()) {
      this.loadMovies();
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.currentPage = 0;
    
    this.movieService.searchMovies(this.searchTerm, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PageResponse<Movie>) => {
          this.movies = response.content;
          this.totalMovies = response.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error searching movies', err);
          this.error = err.error?.error || 'Failed to search movies. Please try again later.';
          this.loading = false;
        }
      });
  }

  onPageChange(page: number): void {
    if (page < 0 || page >= Math.ceil(this.totalMovies / this.pageSize)) {
      return;
    }
    
    this.currentPage = page;
    
    if (this.searchTerm.trim()) {
      this.searchMovies();
    } else {
      this.loadMovies();
    }
  }

  getPaginationArray(): number[] {
    const totalPages = Math.ceil(this.totalMovies / this.pageSize);
    return Array(totalPages).fill(0).map((_, i) => i);
  }
} 