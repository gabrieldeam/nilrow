package marketplace.nilrow.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import marketplace.nilrow.util.GeoPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeocodingService {

    @Value("${google.api.key}")
    private String googleApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public GeoPoint geocode(String cep) {
        try {
            String url = "https://maps.googleapis.com/maps/api/geocode/json?address="
                    + cep + "&key=" + googleApiKey;
            String response = restTemplate.getForObject(url, String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            JsonNode results = root.path("results");
            if (results.isArray() && results.size() > 0) {
                JsonNode location = results.get(0).path("geometry").path("location");
                double lat = location.path("lat").asDouble();
                double lng = location.path("lng").asDouble();
                return new GeoPoint(lat, lng);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        throw new RuntimeException("Erro ao geocodificar CEP: " + cep);
    }
}
