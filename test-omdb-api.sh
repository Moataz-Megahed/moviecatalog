#!/bin/bash

# Your OMDB API key
API_KEY="d471685f"

# Test search query
SEARCH_TERM="Guardians of the Galaxy"
ENCODED_SEARCH_TERM=$(echo $SEARCH_TERM | sed 's/ /%20/g')

# Test with search
echo "Testing OMDB API search for: $SEARCH_TERM"
echo "URL: http://www.omdbapi.com/?apikey=$API_KEY&s=$ENCODED_SEARCH_TERM&type=movie"
curl -s "http://www.omdbapi.com/?apikey=$API_KEY&s=$ENCODED_SEARCH_TERM&type=movie" | json_pp

# Test with a specific movie ID
IMDB_ID="tt3896198" # Guardians of the Galaxy Vol. 2
echo -e "\nTesting OMDB API for specific movie: $IMDB_ID"
echo "URL: http://www.omdbapi.com/?apikey=$API_KEY&i=$IMDB_ID"
curl -s "http://www.omdbapi.com/?apikey=$API_KEY&i=$IMDB_ID" | json_pp

# Test with a specific movie title
MOVIE_TITLE="Guardians of the Galaxy Vol. 2"
ENCODED_MOVIE_TITLE=$(echo $MOVIE_TITLE | sed 's/ /%20/g')
echo -e "\nTesting OMDB API for specific movie title: $MOVIE_TITLE"
echo "URL: http://www.omdbapi.com/?apikey=$API_KEY&t=$ENCODED_MOVIE_TITLE"
curl -s "http://www.omdbapi.com/?apikey=$API_KEY&t=$ENCODED_MOVIE_TITLE" | json_pp 