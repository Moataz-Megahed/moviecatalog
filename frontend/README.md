# Movie Catalog Frontend

This is the Angular frontend for the Movie Catalog application. It interacts with the Spring Boot backend to provide a user-friendly interface for browsing, searching, and managing movies.

## Features

- User authentication (login/register)
- Browse and search movies
- View movie details
- Rate and review movies
- Admin dashboard for managing movies
- Integration with OMDB API for adding new movies

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Angular CLI (v13 or higher)

## Installation

1. Clone the repository
2. Navigate to the frontend directory
3. Install dependencies:

```bash
npm install
```

## Development Server

Run the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you change any of the source files.

## Build

To build the application for production:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Backend Connection

The frontend is configured to connect to the backend at `http://localhost:8080`. If your backend is running on a different URL, update the API URLs in the service files:

- `src/app/services/auth.service.ts`
- `src/app/services/movie.service.ts`
- `src/app/services/user.service.ts`

## Project Structure

- `src/app/components`: Reusable UI components
- `src/app/modules`: Feature modules (admin, auth, movies, user)
- `src/app/services`: Services for API communication
- `src/app/guards`: Route guards for authentication and authorization
- `src/app/models`: TypeScript interfaces for data models

## Authentication

The application uses JWT (JSON Web Token) for authentication. The token is stored in localStorage and automatically included in API requests via the AuthInterceptor. 