import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

public class TestOmdbApi {
    public static void main(String[] args) {
        try {
            // Your OMDB API key
            String apiKey = "d471685f";
            
            // Test search query
            String searchTerm = "Guardians of the Galaxy";
            String encodedSearchTerm = URLEncoder.encode(searchTerm, "UTF-8");
            
            // Construct the URL
            String urlString = "http://www.omdbapi.com/?apikey=" + apiKey + "&s=" + encodedSearchTerm + "&type=movie";
            System.out.println("Testing URL: " + urlString);
            
            // Create URL and open connection
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            
            // Get response code
            int responseCode = connection.getResponseCode();
            System.out.println("Response Code: " + responseCode);
            
            if (responseCode == 200) {
                // Read the response
                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()));
                
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                
                // Print the response
                System.out.println("Response: " + response.toString());
            } else {
                System.out.println("Error: " + responseCode);
            }
            
            // Test with a specific movie ID
            String imdbId = "tt3896198"; // Guardians of the Galaxy Vol. 2
            String urlString2 = "http://www.omdbapi.com/?apikey=" + apiKey + "&i=" + imdbId;
            System.out.println("\nTesting URL for specific movie: " + urlString2);
            
            // Create URL and open connection
            URL url2 = new URL(urlString2);
            HttpURLConnection connection2 = (HttpURLConnection) url2.openConnection();
            connection2.setRequestMethod("GET");
            
            // Get response code
            int responseCode2 = connection2.getResponseCode();
            System.out.println("Response Code: " + responseCode2);
            
            if (responseCode2 == 200) {
                // Read the response
                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection2.getInputStream()));
                
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();
                
                // Print the response
                System.out.println("Response: " + response.toString());
            } else {
                System.out.println("Error: " + responseCode2);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
} 