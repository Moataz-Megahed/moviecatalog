import { Component, OnInit } from '@angular/core';
import { MovieService, Movie, PageResponse } from '../../../../services/movie.service';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit {
  movies: Movie[] = [];
  totalItems = 0;
  currentPage = 0;
  pageSize = 12;
  sortBy = 'id';
  sortDirection = 'asc';
  searchTerm = '';
  loading = false;
  error = '';
  Math = Math; // For use in template

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loading = true;
    this.error = '';
    this.movieService.getAllMovies(this.currentPage, this.pageSize, this.sortBy, this.sortDirection)
      .subscribe({
        next: (response: PageResponse<Movie>) => {
          this.movies = response.content;
          this.totalItems = response.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading movies', err);
          this.error = 'Failed to load movies. Please try again later.';
          this.loading = false;
        }
      });
  }

  search(): void {
    if (!this.searchTerm.trim()) {
      this.loadMovies();
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.movieService.searchMovies(this.searchTerm, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: PageResponse<Movie>) => {
          this.movies = response.content;
          this.totalItems = response.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error searching movies', err);
          this.error = 'Failed to search movies. Please try again later.';
          this.loading = false;
        }
      });
  }

  onPageChange(page: number): void {
    if (page < 0 || page >= Math.ceil(this.totalItems / this.pageSize)) {
      return;
    }
    
    this.currentPage = page;
    if (this.searchTerm.trim()) {
      this.search();
    } else {
      this.loadMovies();
    }
  }

  onSortChange(sortBy: string): void {
    if (this.sortBy === sortBy) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'asc';
    }
    this.loadMovies();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) {
      return 'fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
} 