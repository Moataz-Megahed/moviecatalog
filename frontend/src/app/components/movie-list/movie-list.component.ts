import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';

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

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.loading = true;
    this.movieService.getAllMovies(this.currentPage, this.pageSize, this.sortBy, this.sortDirection)
      .subscribe(
        response => {
          this.movies = response.content;
          this.totalItems = response.totalElements;
          this.loading = false;
        },
        error => {
          console.error('Error loading movies', error);
          this.loading = false;
        }
      );
  }

  search(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.movieService.searchMovies(this.searchTerm, this.currentPage, this.pageSize)
        .subscribe(
          response => {
            this.movies = response.content;
            this.totalItems = response.totalElements;
            this.loading = false;
          },
          error => {
            console.error('Error searching movies', error);
            this.loading = false;
          }
        );
    } else {
      this.loadMovies();
    }
  }

  onPageChange(page: number): void {
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