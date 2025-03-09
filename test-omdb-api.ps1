# Your OMDB API key
$API_KEY = "d471685f"

# Test search query
$SEARCH_TERM = "Guardians of the Galaxy"
$ENCODED_SEARCH_TERM = [System.Web.HttpUtility]::UrlEncode($SEARCH_TERM)

# Test with search
Write-Host "Testing OMDB API search for: $SEARCH_TERM"
Write-Host "URL: http://www.omdbapi.com/?apikey=$API_KEY&s=$ENCODED_SEARCH_TERM&type=movie"
$searchResponse = Invoke-RestMethod -Uri "http://www.omdbapi.com/?apikey=$API_KEY&s=$ENCODED_SEARCH_TERM&type=movie"
$searchResponse | ConvertTo-Json -Depth 10

# Test with a specific movie ID
$IMDB_ID = "tt3896198" # Guardians of the Galaxy Vol. 2
Write-Host "`nTesting OMDB API for specific movie: $IMDB_ID"
Write-Host "URL: http://www.omdbapi.com/?apikey=$API_KEY&i=$IMDB_ID"
$movieResponse = Invoke-RestMethod -Uri "http://www.omdbapi.com/?apikey=$API_KEY&i=$IMDB_ID"
$movieResponse | ConvertTo-Json -Depth 10

# Test with a specific movie title
$MOVIE_TITLE = "Guardians of the Galaxy Vol. 2"
$ENCODED_MOVIE_TITLE = [System.Web.HttpUtility]::UrlEncode($MOVIE_TITLE)
Write-Host "`nTesting OMDB API for specific movie title: $MOVIE_TITLE"
Write-Host "URL: http://www.omdbapi.com/?apikey=$API_KEY&t=$ENCODED_MOVIE_TITLE"
$titleResponse = Invoke-RestMethod -Uri "http://www.omdbapi.com/?apikey=$API_KEY&t=$ENCODED_MOVIE_TITLE"
$titleResponse | ConvertTo-Json -Depth 10 