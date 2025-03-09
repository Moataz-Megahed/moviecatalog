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
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  imdbRating: string;
  imdbID: string;
  Type: string;
  Response: string;
} 