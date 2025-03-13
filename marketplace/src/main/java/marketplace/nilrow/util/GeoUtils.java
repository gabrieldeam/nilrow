package marketplace.nilrow.util;

import marketplace.nilrow.domain.catalog.location.Coordinate;
import marketplace.nilrow.domain.catalog.location.Location;
import marketplace.nilrow.domain.catalog.location.Polygon;
import marketplace.nilrow.domain.catalog.location.PolygonType;

import java.util.List;
import java.util.stream.Collectors;

public class GeoUtils {

    public static class GeoPoint {
        private double latitude;  // Y
        private double longitude; // X

        public GeoPoint() {}

        public GeoPoint(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public double getLatitude() {
            return latitude;
        }

        public double getLongitude() {
            return longitude;
        }
    }

    /**
     * Método clássico: retorna `true` se o ponto estiver em pelo menos
     * um polígono INCLUDED e não estiver em nenhum polígono EXCLUDED
     * **dessa Location**. Útil se quisermos que cada `Location` seja
     * “autocontida” (inclusões e exclusões).
     */
    public static boolean isLocationAllowed(GeoPoint point, Location location) {
        if (location == null ||
                location.getPolygons() == null ||
                location.getPolygons().isEmpty()) {
            return false;
        }

        // Separa polígonos
        List<Polygon> included = location.getPolygons().stream()
                .filter(p -> p.getPolygonType() == PolygonType.INCLUDED)
                .collect(Collectors.toList());

        List<Polygon> excluded = location.getPolygons().stream()
                .filter(p -> p.getPolygonType() == PolygonType.EXCLUDED)
                .collect(Collectors.toList());

        // Se não há polygons INCLUDED, retorna false
        if (included.isEmpty()) {
            return false;
        }

        // Se ponto não está em pelo menos 1 included -> false
        boolean insideIncluded = false;
        for (Polygon poly : included) {
            if (isPointInPolygon(point, poly.getCoordinates())) {
                insideIncluded = true;
                break;
            }
        }
        if (!insideIncluded) {
            return false;
        }

        // Se ponto está em qualquer excluded -> false
        for (Polygon poly : excluded) {
            if (isPointInPolygon(point, poly.getCoordinates())) {
                return false;
            }
        }

        // Caso contrário, true
        return true;
    }

    /**
     * Retorna `true` se o ponto estiver em AO MENOS um polígono EXCLUDED
     * desta Location (independente de existirem incluídos ou não).
     */
    public static boolean isPointInAnyExcludedPolygon(GeoPoint point, Location location) {
        if (location == null || location.getPolygons() == null) {
            return false;
        }
        List<Polygon> excluded = location.getPolygons().stream()
                .filter(p -> p.getPolygonType() == PolygonType.EXCLUDED)
                .collect(Collectors.toList());

        for (Polygon poly : excluded) {
            if (isPointInPolygon(point, poly.getCoordinates())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Retorna `true` se o ponto estiver em AO MENOS um polígono INCLUDED
     * desta Location.
     */
    public static boolean isPointInAnyIncludedPolygon(GeoPoint point, Location location) {
        if (location == null || location.getPolygons() == null) {
            return false;
        }
        List<Polygon> included = location.getPolygons().stream()
                .filter(p -> p.getPolygonType() == PolygonType.INCLUDED)
                .collect(Collectors.toList());

        for (Polygon poly : included) {
            if (isPointInPolygon(point, poly.getCoordinates())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Método principal de ray casting:
     * - Lança um raio horizontal a partir do ponto;
     * - Conta quantas vezes o raio cruza as arestas do polígono;
     * - Ímpar => dentro; Par => fora.
     */
    public static boolean isPointInPolygon(GeoPoint point, List<Coordinate> coordinates) {
        if (coordinates == null || coordinates.isEmpty()) {
            return false;
        }

        int intersectCount = 0;
        for (int i = 0; i < coordinates.size(); i++) {
            Coordinate a = coordinates.get(i);
            Coordinate b = coordinates.get((i + 1) % coordinates.size());
            if (rayIntersectsSegment(point, a, b)) {
                intersectCount++;
            }
        }
        // Se número de interseções é ímpar => dentro
        return (intersectCount % 2) == 1;
    }

    /**
     * Checa se o raio “horizontal” a partir do ponto p
     * cruza o segmento definido por (a,b).
     */
    private static boolean rayIntersectsSegment(GeoPoint p, Coordinate a, Coordinate b) {
        double px = p.getLongitude(); // X do ponto
        double py = p.getLatitude();  // Y do ponto

        double ax = a.getLongitude();
        double ay = a.getLatitude();
        double bx = b.getLongitude();
        double by = b.getLatitude();

        // Garante que 'a' seja o vértice de menor latitude
        if (ay > by) {
            double tempX = ax; double tempY = ay;
            ax = bx;           ay = by;
            bx = tempX;        by = tempY;
        }

        // Evita problemas se o ponto estiver exatamente na mesma latitude
        // de um dos vértices
        if (py == ay || py == by) {
            py += 0.0000001;
        }

        // Se está fora do range vertical do segmento, não cruza
        if (py < ay || py > by) {
            return false;
        }

        // Se o segmento é vertical
        if (ax == bx) {
            // Se o X do ponto é <= X do segmento, conta como interseção
            return px <= ax;
        }

        // Calcula X onde o raio cruza a linha do segmento
        double intersectX = ax + (py - ay) * (bx - ax) / (by - ay);

        // Se X do ponto é <= esse X, conta como interseção
        return px <= intersectX;
    }
}
