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
        public double getLatitude() { return latitude; }
        public double getLongitude() { return longitude; }
    }

    /**
     * Regra:
     * 1) Se a Location tiver pelo menos 1 polígono INCLUDED, o ponto PRECISA estar em pelo menos um deles,
     *    senão devolve false.
     * 2) Se a Location não tiver polígono INCLUDED => também devolve false (ou seja, "não libera").
     * 3) Se passou no included, então verifica se está em algum EXCLUDED. Se estiver, devolve false.
     * 4) Caso contrário, true.
     */
    public static boolean isLocationAllowed(GeoPoint point, Location location) {
        System.out.println("   [GeoUtils] isLocationAllowed => Location: " + location.getName());

        if (location.getPolygons() == null || location.getPolygons().isEmpty()) {
            // Se não existem polygons => não libera nada
            System.out.println("   [GeoUtils] -> Location não tem polygons => false (nenhuma included).");
            return false;
        }

        // Separa included e excluded
        List<Polygon> included = location.getPolygons().stream()
                .filter(p -> p.getPolygonType() == PolygonType.INCLUDED)
                .collect(Collectors.toList());
        List<Polygon> excluded = location.getPolygons().stream()
                .filter(p -> p.getPolygonType() == PolygonType.EXCLUDED)
                .collect(Collectors.toList());

        // 1) se não há included => false
        if (included.isEmpty()) {
            System.out.println("   [GeoUtils] -> 0 polygons INCLUDED => false (regra de negócio).");
            return false;
        }

        // 2) ponto precisa cair em pelo menos 1 included
        boolean insideIncluded = false;
        for (Polygon poly : included) {
            boolean inThis = isPointInPolygon(point, poly.getCoordinates());
            System.out.println("      [GeoUtils] -> isPointInPolygon (INCLUDED) ? " + inThis);
            if (inThis) {
                insideIncluded = true;
                break;
            }
        }
        if (!insideIncluded) {
            System.out.println("   [GeoUtils] -> Ponto NÃO caiu em nenhum polígono de inclusão => FALSE");
            return false;
        }

        // 3) se estiver em qualquer excluded => false
        for (Polygon poly : excluded) {
            boolean inThis = isPointInPolygon(point, poly.getCoordinates());
            System.out.println("      [GeoUtils] -> isPointInPolygon (EXCLUDED)? " + inThis);
            if (inThis) {
                System.out.println("   [GeoUtils] -> Ponto CAIU em polígono EXCLUDED => FALSE");
                return false;
            }
        }

        // 4) se passou => true
        System.out.println("   [GeoUtils] -> Passou pelos included e não está em excluded => TRUE");
        return true;
    }

    // Ray casting
    public static boolean isPointInPolygon(GeoPoint point, List<Coordinate> coordinates) {
        if (coordinates == null || coordinates.isEmpty()) return false;
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
        double px = p.getLongitude(); // X do ponto
        double py = p.getLatitude();  // Y do ponto

        double ax = a.getLongitude();
        double ay = a.getLatitude();
        double bx = b.getLongitude();
        double by = b.getLatitude();

        if (ay > by) {
            double tempX = ax; double tempY = ay;
            ax = bx;           ay = by;
            bx = tempX;        by = tempY;
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
}
