import requests
import json
import urllib.parse

# Your OMDB API key
API_KEY = "d471685f"

# Test search query
SEARCH_TERM = "Guardians of the Galaxy"
ENCODED_SEARCH_TERM = urllib.parse.quote(SEARCH_TERM)

# Test with search
print(f"Testing OMDB API search for: {SEARCH_TERM}")
url = f"http://www.omdbapi.com/?apikey={API_KEY}&s={ENCODED_SEARCH_TERM}&type=movie"
print(f"URL: {url}")
response = requests.get(url)
search_data = response.json()
print(json.dumps(search_data, indent=2))

# Test with a specific movie ID
IMDB_ID = "tt3896198"  # Guardians of the Galaxy Vol. 2
print(f"\nTesting OMDB API for specific movie: {IMDB_ID}")
url = f"http://www.omdbapi.com/?apikey={API_KEY}&i={IMDB_ID}"
print(f"URL: {url}")
response = requests.get(url)
movie_data = response.json()
print(json.dumps(movie_data, indent=2))

# Test with a specific movie title
MOVIE_TITLE = "Guardians of the Galaxy Vol. 2"
ENCODED_MOVIE_TITLE = urllib.parse.quote(MOVIE_TITLE)
print(f"\nTesting OMDB API for specific movie title: {MOVIE_TITLE}")
url = f"http://www.omdbapi.com/?apikey={API_KEY}&t={ENCODED_MOVIE_TITLE}"
print(f"URL: {url}")
response = requests.get(url)
title_data = response.json()
print(json.dumps(title_data, indent=2)) 