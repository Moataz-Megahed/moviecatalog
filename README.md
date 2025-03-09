# Movie Catalog Application

A full-stack application for browsing and managing a movie catalog with OMDB API integration.

## Project Overview

This project consists of:
- **Backend**: Spring Boot application with REST APIs
- **Frontend**: Angular application for the user interface
- **Database**: PostgreSQL for data storage

## Prerequisites

- Java 17 or higher
- Node.js and npm (for Angular frontend)
- PostgreSQL database
- Maven for building the backend

## Setup and Installation

### Database Setup

1. Install PostgreSQL if not already installed
2. Create a database named `movie_catalog`:
   ```sql
   CREATE DATABASE movie_catalog;
   ```
3. The default credentials are:
   - Username: postgres
   - Password: postgres
   
   You can modify these in the `application.properties` file if needed.

### Backend Setup

1. Clone the repository
2. Navigate to the project root directory
3. Build the project using Maven:
   ```bash
   ./mvnw clean install
   ```
   On Windows, use:
   ```bash
   mvnw.cmd clean install
   ```
4. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   On Windows, use:
   ```bash
   mvnw.cmd spring-boot:run
   ```

The backend server will start on port 8080 (http://localhost:8080).

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   npm start
   ```

The frontend application will be available at http://localhost:4200.

## API Documentation

The API documentation is available via Swagger UI at:
http://localhost:8080/swagger-ui.html

## Features

- User authentication and authorization with JWT
- Browse movies from the OMDB API
- Save favorite movies to your personal catalog
- Rate and review movies
- Search for movies by title, actor, director, etc.

## OMDB API Integration

The application uses the OMDB API to fetch movie data. The API key is configured in the `application.properties` file.

## Configuration

### Backend Configuration

The main configuration file is located at `src/main/resources/application.properties`. Key configurations include:

- Server port: 8080
- Database connection details
- OMDB API key and base URL
- JWT secret and expiration time
- CORS configuration

### Frontend Configuration

The Angular application configuration can be found in the `frontend/src/environments` directory.

## Running in Production

### Backend

To run the backend in production mode:

```bash
./mvnw spring-boot:run -Pprod
```

### Frontend

To build the frontend for production:

```bash
cd frontend
npm run build
```

The production build will be generated in the `frontend/dist` directory.

## Testing

### Backend Tests

Run the backend tests using:

```bash
./mvnw test
```

### Frontend Tests

Run the frontend tests using:

```bash
cd frontend
npm test
```

## Troubleshooting

### Common Issues

- If you encounter database connection issues, ensure PostgreSQL is running and the credentials in `application.properties` are correct.
- For frontend issues, check the browser console for errors.
- Make sure the OMDB API key is valid and properly configured.

### Bean Definition Conflicts

If you encounter the following error during build or startup:

```
BeanDefinitionOverrideException: Invalid bean definition with name 'passwordEncoder'
```

This is caused by duplicate bean definitions in both `SecurityConfig` and `EncoderConfig` classes. To fix this:

1. Option 1: Enable bean overriding by adding the following to your `application.properties`:
   ```properties
   spring.main.allow-bean-definition-overriding=true
   ```

2. Option 2 (Recommended): Fix the duplicate bean definitions by:
   - Keep the `passwordEncoder` bean in only one configuration class
   - Remove it from the other class or rename it to be unique

### JDK Version Issues

- This application requires Java 17. If you're using a newer version (like Java 22), you might encounter compatibility issues.
- If using Java 22, you may need to add the `--enable-preview` flag to your Maven commands.

## License

This project is open source and available under the [MIT License](LICENSE). 