package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.location.*;
import marketplace.nilrow.repositories.CatalogRepository;
import marketplace.nilrow.repositories.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private CatalogRepository catalogRepository;

    public LocationDTO createLocation(LocationDTO locationDTO, String catalogId) {
        Optional<Catalog> catalogOpt = catalogRepository.findById(catalogId);
        if (catalogOpt.isEmpty()) {
            throw new RuntimeException("Catálogo não encontrado");
        }

        Catalog catalog = catalogOpt.get();
        Location location = convertToEntity(locationDTO, catalog);

        Location savedLocation = locationRepository.save(location);
        return convertToDTO(savedLocation);
    }

    public void deleteLocation(String locationId) {
        locationRepository.deleteById(locationId);
    }

    public List<LocationDTO> getLocationsByCatalogId(String catalogId) {
        return locationRepository.findByCatalogId(catalogId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ----------------------------------------------------
    private Location convertToEntity(LocationDTO locationDTO, Catalog catalog) {
        Location location = new Location();
        location.setName(locationDTO.getName());
        location.setPosition(locationDTO.getPosition());
        location.setAction(locationDTO.getAction());
        location.setCatalog(catalog);

        // Juntaremos tudo em location.polygons
        List<Polygon> polygons = new ArrayList<>();

        // 1) Montar polygons de INCLUDED, a partir de locationDTO.includedPolygons
        if (locationDTO.getIncludedPolygons() != null) {
            for (List<List<Double>> coordsList : locationDTO.getIncludedPolygons()) {
                Polygon polygon = new Polygon();
                polygon.setLocation(location);
                polygon.setPolygonType(PolygonType.INCLUDED);

                List<Coordinate> coords = coordsList.stream()
                        // coordsList é List<[lat, lon]>
                        .map(coord -> new Coordinate(null, coord.get(0), coord.get(1)))
                        .collect(Collectors.toList());
                polygon.setCoordinates(coords);

                polygons.add(polygon);
            }
        }

        // 2) Montar polygons de EXCLUDED, a partir de locationDTO.excludedPolygons
        if (locationDTO.getExcludedPolygons() != null) {
            for (List<List<Double>> coordsList : locationDTO.getExcludedPolygons()) {
                Polygon polygon = new Polygon();
                polygon.setLocation(location);
                polygon.setPolygonType(PolygonType.EXCLUDED);

                List<Coordinate> coords = coordsList.stream()
                        .map(coord -> new Coordinate(null, coord.get(0), coord.get(1)))
                        .collect(Collectors.toList());
                polygon.setCoordinates(coords);

                polygons.add(polygon);
            }
        }

        // define na location
        location.setPolygons(polygons);
        return location;
    }

    private LocationDTO convertToDTO(Location location) {
        LocationDTO dto = new LocationDTO();
        dto.setId(location.getId());
        dto.setName(location.getName());
        dto.setPosition(location.getPosition());
        dto.setAction(location.getAction());

        // Agora precisamos separar polygons de type INCLUDED ou EXCLUDED
        List<List<List<Double>>> includedPolygons = new ArrayList<>();
        List<List<List<Double>>> excludedPolygons = new ArrayList<>();

        if (location.getPolygons() != null) {
            for (Polygon poly : location.getPolygons()) {
                // Converte polygon de List<Coordinate> => List<[lat, lon]>
                List<List<Double>> latLonList = poly.getCoordinates().stream()
                        .map(coord -> List.of(coord.getLatitude(), coord.getLongitude()))
                        .collect(Collectors.toList());
                if (poly.getPolygonType() == PolygonType.INCLUDED) {
                    includedPolygons.add(latLonList);
                } else if (poly.getPolygonType() == PolygonType.EXCLUDED) {
                    excludedPolygons.add(latLonList);
                }
            }
        }

        dto.setIncludedPolygons(includedPolygons);
        dto.setExcludedPolygons(excludedPolygons);
        return dto;
    }
}
