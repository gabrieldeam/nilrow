package marketplace.nilrow.util;

import marketplace.nilrow.domain.catalog.location.Coordinate;
import marketplace.nilrow.domain.catalog.location.Location;
import marketplace.nilrow.domain.catalog.location.Polygon;

import java.util.List;

public class GeoUtils {

    // Verifica se o ponto está dentro de um polígono usando o algoritmo de ray-casting
    public static boolean isPointInPolygon(GeoPoint point, List<Coordinate> coordinates) {
        int intersectCount = 0;
        for (int i = 0; i < coordinates.size(); i++) {
            Coordinate a = coordinates.get(i);
            Coordinate b = coordinates.get((i + 1) % coordinates.size());
            if (rayIntersectsSegment(point, a, b)) {
                intersectCount++;
            }
        }
        return (intersectCount % 2) == 1;
    }

    private static boolean rayIntersectsSegment(GeoPoint p, Coordinate a, Coordinate b) {
        double px = p.getLongitude();   // longitude: x
        double py = p.getLatitude();      // latitude: y
        double ax = a.getLongitude();
        double ay = a.getLatitude();
        double bx = b.getLongitude();
        double by = b.getLatitude();

        if (ay > by) {
            double tempX = ax, tempY = ay;
            ax = bx; ay = by;
            bx = tempX; by = tempY;
        }
        if (py == ay || py == by) {
            py += 0.0000001;
        }
        if (py < ay || py > by) {
            return false;
        }
        if (ax == bx) {
            return px <= ax;
        }
        double intersectX = ax + (py - ay) * (bx - ax) / (by - ay);
        return px <= intersectX;
    }

    // Verifica se o ponto é permitido para uma Location:
    // Deve estar dentro de ao menos um polígono incluído e fora de todos os polígonos excluídos.
    public static boolean isLocationAllowed(GeoPoint point, Location location) {
        boolean included = false;
        if (location.getIncludedPolygons() != null && !location.getIncludedPolygons().isEmpty()) {
            for (Polygon poly : location.getIncludedPolygons()) {
                if (poly.getCoordinates() != null && !poly.getCoordinates().isEmpty() &&
                        isPointInPolygon(point, poly.getCoordinates())) {
                    included = true;
                    break;
                }
            }
        } else {
            // Se não houver polígonos incluídos, pode-se considerar que não há restrição.
            included = true;
        }
        if (location.getExcludedPolygons() != null && !location.getExcludedPolygons().isEmpty()) {
            for (Polygon poly : location.getExcludedPolygons()) {
                if (poly.getCoordinates() != null && !poly.getCoordinates().isEmpty() &&
                        isPointInPolygon(point, poly.getCoordinates())) {
                    return false;
                }
            }
        }
        return included;
    }
}
