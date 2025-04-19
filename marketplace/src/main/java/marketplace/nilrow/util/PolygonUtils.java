package marketplace.nilrow.util;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryCoordinate;
import marketplace.nilrow.domain.catalog.shipping.delivery.DeliveryRadius;

public class PolygonUtils {

    /**
     * Verifica se um ponto (latitude, longitude) está dentro do polígono representado
     * pela lista de DeliveryCoordinate. Utiliza o algoritmo de ray casting.
     *
     * @param lat Latitude do ponto
     * @param lon Longitude do ponto
     * @param polygon Lista de DeliveryCoordinate que define o polígono
     * @return true se o ponto estiver dentro do polígono, false caso contrário
     */
    public static boolean isPointInPolygon(double lat, double lon, List<? extends GeoCoordinate> polygon) {
        boolean inside = false;
        int n = polygon.size();
        for (int i = 0, j = n - 1; i < n; j = i++) {
            double lat_i = polygon.get(i).getLatitude();
            double lon_i = polygon.get(i).getLongitude();
            double lat_j = polygon.get(j).getLatitude();
            double lon_j = polygon.get(j).getLongitude();

            boolean intersect = ((lat_i > lat) != (lat_j > lat)) &&
                    (lon < (lon_j - lon_i) * (lat - lat_i) / (lat_j - lat_i) + lon_i);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }

    /**
     * Dada uma lista de DeliveryRadius e um ponto (lat, lon), retorna o preço do delivery
     * do menor raio (mais restritivo) que contenha o ponto.
     * Se o ponto não estiver em nenhum raio, retorna null.
     *
     * @param radii Lista de DeliveryRadius
     * @param lat Latitude do ponto
     * @param lon Longitude do ponto
     * @return BigDecimal com o preço ou null se não houver correspondência
     */
    public static BigDecimal getDeliveryPriceForPoint(List<DeliveryRadius> radii, double lat, double lon) {
        return radii.stream()
                .filter(r -> r.getCoordinates() != null && !r.getCoordinates().isEmpty() &&
                        isPointInPolygon(lat, lon, r.getCoordinates()))
                .min(Comparator.comparingDouble(DeliveryRadius::getRadius))
                .map(DeliveryRadius::getPrice)
                .orElse(null);
    }
}